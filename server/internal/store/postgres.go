package store

import (
	"context"
	"errors"
	"fmt"
	"sort"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Postgres guarda los datos en PostgreSQL. El esquema vive en internal/db/migrations.
type Postgres struct {
	pool *pgxpool.Pool
}

func NewPostgres(pool *pgxpool.Pool) *Postgres {
	return &Postgres{pool: pool}
}

const productColumns = `id, name, price_cents, stock, image, abv, description`

func scanProduct(row pgx.Row) (Product, error) {
	var p Product
	err := row.Scan(&p.ID, &p.Name, &p.PriceCents, &p.Stock, &p.Image, &p.ABV, &p.Description)
	return p, err
}

func (s *Postgres) ListProducts(ctx context.Context) ([]Product, error) {
	rows, err := s.pool.Query(ctx, `SELECT `+productColumns+` FROM products WHERE active ORDER BY price_cents`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []Product{}
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (s *Postgres) GetProduct(ctx context.Context, id string) (Product, error) {
	p, err := scanProduct(s.pool.QueryRow(ctx, `SELECT `+productColumns+` FROM products WHERE id = $1 AND active`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return Product{}, ErrNotFound
	}
	return p, err
}

func (s *Postgres) CreateOrder(ctx context.Context, o Order) (Order, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return Order{}, err
	}
	defer tx.Rollback(ctx) //nolint:errcheck // no-op después de Commit

	// Descuento de inventario: el WHERE stock >= qty evita vender de más aunque
	// lleguen dos pedidos al mismo tiempo. Se recorren los productos en orden
	// para que dos transacciones no se bloqueen entre sí.
	need := map[string]int{}
	for _, it := range o.Items {
		need[it.ProductID] += it.Qty
	}
	ids := make([]string, 0, len(need))
	for id := range need {
		ids = append(ids, id)
	}
	sort.Strings(ids)

	for _, id := range ids {
		tag, err := tx.Exec(ctx,
			`UPDATE products SET stock = stock - $2, updated_at = now() WHERE id = $1 AND active AND stock >= $2`,
			id, need[id])
		if err != nil {
			return Order{}, err
		}
		if tag.RowsAffected() == 0 {
			var name string
			var stock int
			err := tx.QueryRow(ctx, `SELECT name, stock FROM products WHERE id = $1 AND active`, id).Scan(&name, &stock)
			if errors.Is(err, pgx.ErrNoRows) {
				return Order{}, ErrNotFound
			}
			if err != nil {
				return Order{}, err
			}
			return Order{}, fmt.Errorf("%w: %s (disponibles %d)", ErrInsufficientStock, name, stock)
		}
	}

	year := o.CreatedAt.Year()
	var seq int
	if err := tx.QueryRow(ctx, `
		INSERT INTO folio_counters (year, last) VALUES ($1, 1)
		ON CONFLICT (year) DO UPDATE SET last = folio_counters.last + 1
		RETURNING last`, year).Scan(&seq); err != nil {
		return Order{}, err
	}
	o.Folio = fmt.Sprintf("MS-%d-%04d", year, seq)

	var orderID int64
	if err := tx.QueryRow(ctx, `
		INSERT INTO orders (folio, status, customer_name, customer_phone, customer_email, customer_address, total_cents, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
		RETURNING id`,
		o.Folio, o.Status, o.Customer.Name, o.Customer.Phone, o.Customer.Email, o.Customer.Address, o.TotalCents, o.CreatedAt,
	).Scan(&orderID); err != nil {
		return Order{}, err
	}

	for _, it := range o.Items {
		if _, err := tx.Exec(ctx, `
			INSERT INTO order_items (order_id, product_id, name, qty, unit_price_cents, subtotal_cents)
			VALUES ($1, $2, $3, $4, $5, $6)`,
			orderID, it.ProductID, it.Name, it.Qty, it.UnitPriceCents, it.SubtotalCents); err != nil {
			return Order{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return Order{}, err
	}
	return o, nil
}

func (s *Postgres) GetOrder(ctx context.Context, folio string) (Order, error) {
	var o Order
	var id int64
	err := s.pool.QueryRow(ctx, `
		SELECT id, folio, status, customer_name, customer_phone, customer_email, customer_address, total_cents, created_at
		FROM orders WHERE folio = $1`, folio,
	).Scan(&id, &o.Folio, &o.Status, &o.Customer.Name, &o.Customer.Phone, &o.Customer.Email, &o.Customer.Address, &o.TotalCents, &o.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Order{}, ErrNotFound
	}
	if err != nil {
		return Order{}, err
	}

	rows, err := s.pool.Query(ctx, `
		SELECT product_id, name, qty, unit_price_cents, subtotal_cents
		FROM order_items WHERE order_id = $1 ORDER BY id`, id)
	if err != nil {
		return Order{}, err
	}
	defer rows.Close()
	for rows.Next() {
		var it OrderItem
		if err := rows.Scan(&it.ProductID, &it.Name, &it.Qty, &it.UnitPriceCents, &it.SubtotalCents); err != nil {
			return Order{}, err
		}
		o.Items = append(o.Items, it)
	}
	return o, rows.Err()
}
