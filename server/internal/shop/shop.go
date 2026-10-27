// Package shop contiene las reglas de negocio: valida pedidos y calcula los
// precios del lado del servidor, sin confiar en lo que mande el navegador.
package shop

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"milsensaciones/server/internal/store"
)

const maxQtyPerItem = 24

// ValidationError agrupa los campos inválidos para mostrarlos en el formulario.
type ValidationError struct {
	Fields map[string]string
}

func (e *ValidationError) Error() string {
	parts := make([]string, 0, len(e.Fields))
	for k, v := range e.Fields {
		parts = append(parts, k+": "+v)
	}
	return "datos inválidos: " + strings.Join(parts, "; ")
}

type ItemRequest struct {
	ID  string `json:"id"`
	Qty int    `json:"qty"`
}

type OrderRequest struct {
	Customer store.Customer `json:"customer"`
	Items    []ItemRequest  `json:"items"`
}

type Service struct {
	store store.Store
	now   func() time.Time
}

func NewService(s store.Store) *Service {
	return &Service{store: s, now: time.Now}
}

func (s *Service) Products(ctx context.Context) ([]store.Product, error) {
	return s.store.ListProducts(ctx)
}

func (s *Service) Product(ctx context.Context, id string) (store.Product, error) {
	return s.store.GetProduct(ctx, id)
}

func (s *Service) Order(ctx context.Context, folio string) (store.Order, error) {
	return s.store.GetOrder(ctx, folio)
}

func (s *Service) PlaceOrder(ctx context.Context, req OrderRequest) (store.Order, error) {
	c := store.Customer{
		Name:    strings.TrimSpace(req.Customer.Name),
		Phone:   strings.TrimSpace(req.Customer.Phone),
		Email:   strings.TrimSpace(req.Customer.Email),
		Address: strings.TrimSpace(req.Customer.Address),
	}

	fields := map[string]string{}
	if c.Name == "" {
		fields["name"] = "requerido"
	}
	if digits := countDigits(c.Phone); digits < 10 {
		fields["phone"] = "debe tener al menos 10 dígitos"
	}
	if _, err := mail.ParseAddress(c.Email); err != nil {
		fields["email"] = "correo inválido"
	}
	if c.Address == "" {
		fields["address"] = "requerido"
	}
	if len(req.Items) == 0 {
		fields["items"] = "el carrito está vacío"
	}

	var items []store.OrderItem
	var total int64
	for _, it := range req.Items {
		if it.Qty < 1 || it.Qty > maxQtyPerItem {
			fields["items"] = fmt.Sprintf("la cantidad de %q debe estar entre 1 y %d", it.ID, maxQtyPerItem)
			continue
		}
		p, err := s.store.GetProduct(ctx, it.ID)
		if errors.Is(err, store.ErrNotFound) {
			fields["items"] = fmt.Sprintf("producto %q no existe", it.ID)
			continue
		}
		if err != nil {
			return store.Order{}, err
		}
		sub := p.PriceCents * int64(it.Qty)
		items = append(items, store.OrderItem{
			ProductID: p.ID, Name: p.Name, Qty: it.Qty,
			UnitPriceCents: p.PriceCents, SubtotalCents: sub,
		})
		total += sub
	}
	if len(fields) > 0 {
		return store.Order{}, &ValidationError{Fields: fields}
	}

	return s.store.CreateOrder(ctx, store.Order{
		Status:     store.StatusReceived,
		Customer:   c,
		Items:      items,
		TotalCents: total,
		CreatedAt:  s.now(),
	})
}

func countDigits(s string) int {
	n := 0
	for _, r := range s {
		if r >= '0' && r <= '9' {
			n++
		}
	}
	return n
}
