package store

import (
	"context"
	"fmt"
	"sort"
	"sync"
)

// Memory guarda todo en memoria. Los datos se pierden al reiniciar el servidor.
type Memory struct {
	mu       sync.Mutex
	products map[string]Product
	orders   map[string]Order
	seq      map[int]int // consecutivo de folio por año
}

func NewMemory(products []Product) *Memory {
	m := &Memory{
		products: make(map[string]Product, len(products)),
		orders:   make(map[string]Order),
		seq:      make(map[int]int),
	}
	for _, p := range products {
		m.products[p.ID] = p
	}
	return m
}

func (m *Memory) ListProducts(_ context.Context) ([]Product, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	out := make([]Product, 0, len(m.products))
	for _, p := range m.products {
		out = append(out, p)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].PriceCents < out[j].PriceCents })
	return out, nil
}

func (m *Memory) GetProduct(_ context.Context, id string) (Product, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	p, ok := m.products[id]
	if !ok {
		return Product{}, ErrNotFound
	}
	return p, nil
}

func (m *Memory) CreateOrder(_ context.Context, o Order) (Order, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Se valida todo antes de descontar para no dejar el inventario a medias.
	need := make(map[string]int)
	for _, it := range o.Items {
		need[it.ProductID] += it.Qty
	}
	for id, qty := range need {
		p, ok := m.products[id]
		if !ok {
			return Order{}, ErrNotFound
		}
		if p.Stock < qty {
			return Order{}, fmt.Errorf("%w: %s (disponibles %d)", ErrInsufficientStock, p.Name, p.Stock)
		}
	}
	for id, qty := range need {
		p := m.products[id]
		p.Stock -= qty
		m.products[id] = p
	}

	year := o.CreatedAt.Year()
	m.seq[year]++
	o.Folio = fmt.Sprintf("MS-%d-%04d", year, m.seq[year])
	m.orders[o.Folio] = o
	return o, nil
}

func (m *Memory) GetOrder(_ context.Context, folio string) (Order, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	o, ok := m.orders[folio]
	if !ok {
		return Order{}, ErrNotFound
	}
	return o, nil
}
