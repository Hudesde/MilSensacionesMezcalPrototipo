package shop

import (
	"context"
	"errors"
	"testing"
	"time"

	"milsensaciones/server/internal/store"
)

func newTestService() (*Service, *store.Memory) {
	mem := store.NewMemory([]store.Product{
		{ID: "espadin", Name: "Espadín", PriceCents: 85000, Stock: 5},
		{ID: "curados", Name: "Curados", PriceCents: 75000, Stock: 1},
	})
	svc := NewService(mem)
	svc.now = func() time.Time { return time.Date(2026, 10, 26, 12, 0, 0, 0, time.UTC) }
	return svc, mem
}

var validCustomer = store.Customer{
	Name: "Ana López", Phone: "951 123 4567", Email: "ana@example.com", Address: "Calle 1, Oaxaca",
}

func TestPlaceOrderUsesServerPricesAndFolio(t *testing.T) {
	svc, mem := newTestService()

	o, err := svc.PlaceOrder(context.Background(), OrderRequest{
		Customer: validCustomer,
		Items:    []ItemRequest{{ID: "espadin", Qty: 2}, {ID: "curados", Qty: 1}},
	})
	if err != nil {
		t.Fatal(err)
	}
	if o.Folio != "MS-2026-0001" {
		t.Errorf("folio = %q", o.Folio)
	}
	if o.TotalCents != 2*85000+75000 {
		t.Errorf("total = %d", o.TotalCents)
	}
	if o.Status != store.StatusReceived {
		t.Errorf("status = %q", o.Status)
	}
	p, _ := mem.GetProduct(context.Background(), "espadin")
	if p.Stock != 3 {
		t.Errorf("stock espadin = %d, want 3", p.Stock)
	}

	o2, err := svc.PlaceOrder(context.Background(), OrderRequest{Customer: validCustomer, Items: []ItemRequest{{ID: "espadin", Qty: 1}}})
	if err != nil {
		t.Fatal(err)
	}
	if o2.Folio != "MS-2026-0002" {
		t.Errorf("segundo folio = %q", o2.Folio)
	}
}

func TestPlaceOrderInsufficientStockLeavesInventoryIntact(t *testing.T) {
	svc, mem := newTestService()

	_, err := svc.PlaceOrder(context.Background(), OrderRequest{
		Customer: validCustomer,
		Items:    []ItemRequest{{ID: "espadin", Qty: 2}, {ID: "curados", Qty: 2}},
	})
	if !errors.Is(err, store.ErrInsufficientStock) {
		t.Fatalf("err = %v, want ErrInsufficientStock", err)
	}
	p, _ := mem.GetProduct(context.Background(), "espadin")
	if p.Stock != 5 {
		t.Errorf("stock espadin = %d, no debió cambiar", p.Stock)
	}
}

func TestPlaceOrderValidation(t *testing.T) {
	svc, _ := newTestService()

	_, err := svc.PlaceOrder(context.Background(), OrderRequest{
		Customer: store.Customer{Name: " ", Phone: "123", Email: "no-es-correo"},
		Items:    []ItemRequest{{ID: "tequila", Qty: 1}},
	})
	var verr *ValidationError
	if !errors.As(err, &verr) {
		t.Fatalf("err = %v, want ValidationError", err)
	}
	for _, f := range []string{"name", "phone", "email", "address", "items"} {
		if _, ok := verr.Fields[f]; !ok {
			t.Errorf("falta error para %q", f)
		}
	}
}

func TestPlaceOrderRejectsBadQuantities(t *testing.T) {
	svc, _ := newTestService()
	for _, qty := range []int{0, -1, maxQtyPerItem + 1} {
		_, err := svc.PlaceOrder(context.Background(), OrderRequest{Customer: validCustomer, Items: []ItemRequest{{ID: "espadin", Qty: qty}}})
		var verr *ValidationError
		if !errors.As(err, &verr) {
			t.Errorf("qty %d: err = %v, want ValidationError", qty, err)
		}
	}
}
