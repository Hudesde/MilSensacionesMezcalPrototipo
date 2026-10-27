// Package store define el modelo de datos de la tienda y el contrato de
// almacenamiento. La implementación en memoria sirve para desarrollo; la de
// PostgreSQL implementará la misma interfaz.
package store

import (
	"context"
	"errors"
	"time"
)

var (
	ErrNotFound          = errors.New("no encontrado")
	ErrInsufficientStock = errors.New("inventario insuficiente")
)

type Product struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	PriceCents  int64  `json:"priceCents"`
	Stock       int    `json:"stock"`
	Image       string `json:"img"`
	ABV         string `json:"abv"`
	Description string `json:"description"`
}

type OrderStatus string

const (
	StatusReceived       OrderStatus = "orden_recibida"
	StatusPaymentPending OrderStatus = "pago_pendiente"
	StatusPaid           OrderStatus = "pago_confirmado"
	StatusPacking        OrderStatus = "en_empaque"
	StatusInTransit      OrderStatus = "en_transito"
	StatusDelivered      OrderStatus = "entregado"
	StatusCancelled      OrderStatus = "cancelado"
)

type Customer struct {
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Address string `json:"address"`
}

type OrderItem struct {
	ProductID      string `json:"productId"`
	Name           string `json:"name"`
	Qty            int    `json:"qty"`
	UnitPriceCents int64  `json:"unitPriceCents"`
	SubtotalCents  int64  `json:"subtotalCents"`
}

type Order struct {
	Folio      string      `json:"folio"`
	Status     OrderStatus `json:"status"`
	Customer   Customer    `json:"customer"`
	Items      []OrderItem `json:"items"`
	TotalCents int64       `json:"totalCents"`
	CreatedAt  time.Time   `json:"createdAt"`
}

// Store es el contrato que usa la capa de servicio.
type Store interface {
	ListProducts(ctx context.Context) ([]Product, error)
	GetProduct(ctx context.Context, id string) (Product, error)
	// CreateOrder descuenta el inventario y asigna el folio de forma atómica.
	// Si algún producto no alcanza, no modifica nada y devuelve ErrInsufficientStock.
	CreateOrder(ctx context.Context, o Order) (Order, error)
	GetOrder(ctx context.Context, folio string) (Order, error)
}
