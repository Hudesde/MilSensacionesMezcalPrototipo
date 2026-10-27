package store_test

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"milsensaciones/server/internal/db"
	"milsensaciones/server/internal/store"
)

// Requiere TEST_DATABASE_URL apuntando a una base desechable: la prueba borra
// y recrea todas las tablas.
func openTestDB(t *testing.T) *pgxpool.Pool {
	t.Helper()
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("TEST_DATABASE_URL no definida")
	}
	ctx := context.Background()
	pool, err := db.Open(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(pool.Close)

	if _, err := pool.Exec(ctx, `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`); err != nil {
		t.Fatal(err)
	}
	if err := db.Migrate(ctx, pool, slog.New(slog.NewTextHandler(io.Discard, nil))); err != nil {
		t.Fatal(err)
	}
	return pool
}

func order(productID string, qty int, price int64) store.Order {
	return store.Order{
		Status:     store.StatusReceived,
		Customer:   store.Customer{Name: "Prueba", Phone: "9511234567", Email: "p@example.com", Address: "Oaxaca"},
		Items:      []store.OrderItem{{ProductID: productID, Name: productID, Qty: qty, UnitPriceCents: price, SubtotalCents: price * int64(qty)}},
		TotalCents: price * int64(qty),
		CreatedAt:  time.Date(2026, 10, 26, 12, 0, 0, 0, time.UTC),
	}
}

func TestPostgresOrderRoundTrip(t *testing.T) {
	ctx := context.Background()
	s := store.NewPostgres(openTestDB(t))

	o, err := s.CreateOrder(ctx, order("espadin", 2, 85000))
	if err != nil {
		t.Fatal(err)
	}
	if o.Folio != "MS-2026-0001" {
		t.Errorf("folio = %q", o.Folio)
	}

	got, err := s.GetOrder(ctx, o.Folio)
	if err != nil {
		t.Fatal(err)
	}
	if got.TotalCents != 170000 || len(got.Items) != 1 || got.Items[0].Qty != 2 {
		t.Errorf("pedido leído = %+v", got)
	}

	p, _ := s.GetProduct(ctx, "espadin")
	if p.Stock != 118 {
		t.Errorf("stock = %d, want 118", p.Stock)
	}

	if _, err := s.GetOrder(ctx, "MS-1999-0001"); !errors.Is(err, store.ErrNotFound) {
		t.Errorf("err = %v, want ErrNotFound", err)
	}
}

// Silvestre tiene 40 botellas: 60 pedidos simultáneos de 1 deben dejar 40
// ventas, 20 rechazos, stock en 0 y folios sin repetir.
func TestPostgresConcurrentOrdersNeverOversell(t *testing.T) {
	ctx := context.Background()
	s := store.NewPostgres(openTestDB(t))

	var wg sync.WaitGroup
	var mu sync.Mutex
	ok, rejected := 0, 0
	folios := map[string]bool{}

	for i := 0; i < 60; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			o, err := s.CreateOrder(ctx, order("silvestre", 1, 145000))
			mu.Lock()
			defer mu.Unlock()
			switch {
			case err == nil:
				ok++
				folios[o.Folio] = true
			case errors.Is(err, store.ErrInsufficientStock):
				rejected++
			default:
				t.Error(err)
			}
		}()
	}
	wg.Wait()

	if ok != 40 || rejected != 20 {
		t.Errorf("vendidos=%d rechazados=%d, want 40 y 20", ok, rejected)
	}
	if len(folios) != ok {
		t.Errorf("folios repetidos: %d únicos de %d", len(folios), ok)
	}
	p, _ := s.GetProduct(ctx, "silvestre")
	if p.Stock != 0 {
		t.Errorf("stock final = %d", p.Stock)
	}
}
