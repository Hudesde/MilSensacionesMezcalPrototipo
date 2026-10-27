package api

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"milsensaciones/server/internal/shop"
	"milsensaciones/server/internal/store"
)

func newTestServer(t *testing.T) *httptest.Server {
	t.Helper()
	site := t.TempDir()
	must(t, os.WriteFile(filepath.Join(site, "index.html"), []byte("<h1>inicio</h1>"), 0o644))
	must(t, os.MkdirAll(filepath.Join(site, "assets"), 0o755))
	must(t, os.WriteFile(filepath.Join(site, "assets", "a.css"), []byte("body{}"), 0o644))
	must(t, os.MkdirAll(filepath.Join(site, "docs"), 0o755))
	must(t, os.WriteFile(filepath.Join(site, "docs", "secreto.txt"), []byte("x"), 0o644))

	svc := shop.NewService(store.NewMemory(store.SeedProducts()))
	log := slog.New(slog.NewTextHandler(io.Discard, nil))
	srv := httptest.NewServer(NewRouter(svc, Config{SiteDir: site, Log: log, Storage: "memory"}))
	t.Cleanup(srv.Close)
	return srv
}

func must(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}

func TestProductsEndpoint(t *testing.T) {
	srv := newTestServer(t)

	res, err := http.Get(srv.URL + "/api/products")
	must(t, err)
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d", res.StatusCode)
	}
	var ps []store.Product
	must(t, json.NewDecoder(res.Body).Decode(&ps))
	if len(ps) != 4 {
		t.Errorf("productos = %d, want 4", len(ps))
	}

	res2, err := http.Get(srv.URL + "/api/products/mezcal-falso")
	must(t, err)
	res2.Body.Close()
	if res2.StatusCode != http.StatusNotFound {
		t.Errorf("producto inexistente: status = %d", res2.StatusCode)
	}
}

func TestCreateAndFetchOrder(t *testing.T) {
	srv := newTestServer(t)

	// El navegador manda un precio falso; el servidor debe ignorarlo.
	body := `{"customer":{"name":"Ana","phone":"9511234567","email":"ana@example.com","address":"Oaxaca"},
	          "items":[{"id":"espadin","qty":2}]}`
	res, err := http.Post(srv.URL+"/api/orders", "application/json", strings.NewReader(body))
	must(t, err)
	defer res.Body.Close()
	if res.StatusCode != http.StatusCreated {
		b, _ := io.ReadAll(res.Body)
		t.Fatalf("status = %d: %s", res.StatusCode, b)
	}
	var o store.Order
	must(t, json.NewDecoder(res.Body).Decode(&o))
	if o.TotalCents != 170000 {
		t.Errorf("total = %d", o.TotalCents)
	}

	res2, err := http.Get(srv.URL + "/api/orders/" + o.Folio)
	must(t, err)
	res2.Body.Close()
	if res2.StatusCode != http.StatusOK {
		t.Errorf("consulta por folio: status = %d", res2.StatusCode)
	}
}

func TestCreateOrderErrors(t *testing.T) {
	srv := newTestServer(t)
	cases := []struct {
		name, body string
		want       int
	}{
		{"json roto", `{"customer":`, http.StatusBadRequest},
		{"campo desconocido con precio", `{"customer":{},"items":[],"total":1}`, http.StatusBadRequest},
		{"datos inválidos", `{"customer":{"name":""},"items":[]}`, http.StatusUnprocessableEntity},
		{"sin inventario", `{"customer":{"name":"Ana","phone":"9511234567","email":"a@b.mx","address":"x"},"items":[{"id":"silvestre","qty":24},{"id":"silvestre","qty":24}]}`, http.StatusConflict},
	}
	for _, c := range cases {
		res, err := http.Post(srv.URL+"/api/orders", "application/json", strings.NewReader(c.body))
		must(t, err)
		res.Body.Close()
		if res.StatusCode != c.want {
			t.Errorf("%s: status = %d, want %d", c.name, res.StatusCode, c.want)
		}
	}
}

func TestSiteHandlerOnlyServesPublicFiles(t *testing.T) {
	srv := newTestServer(t)
	cases := map[string]int{
		"/":                           http.StatusOK,
		"/index.html":                 http.StatusOK,
		"/assets/a.css":               http.StatusOK,
		"/docs/secreto.txt":           http.StatusNotFound,
		"/api/no-existe":              http.StatusNotFound,
		"/assets/../docs/secreto.txt": http.StatusNotFound,
	}
	for path, want := range cases {
		res, err := http.Get(srv.URL + path)
		must(t, err)
		res.Body.Close()
		if res.StatusCode != want {
			t.Errorf("%s: status = %d, want %d", path, res.StatusCode, want)
		}
	}
}
