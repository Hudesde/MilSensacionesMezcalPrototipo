// Package api expone la tienda por HTTP y sirve los archivos del sitio.
package api

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"milsensaciones/server/internal/shop"
	"milsensaciones/server/internal/store"
)

const maxBodyBytes = 64 << 10

type Config struct {
	SiteDir string // carpeta con los .html y assets/
	Log     *slog.Logger
	Storage string                          // "postgres" o "memory", se reporta en /api/health
	Ping    func(ctx context.Context) error // verifica la base de datos; nil si no hay
}

type API struct {
	shop *shop.Service
	log  *slog.Logger
	cfg  Config
}

// NewRouter arma todas las rutas de la API y del sitio.
func NewRouter(svc *shop.Service, cfg Config) http.Handler {
	a := &API{shop: svc, log: cfg.Log, cfg: cfg}
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", a.health)
	mux.HandleFunc("GET /api/docs", a.docs)
	mux.HandleFunc("GET /api/openapi.yaml", a.openAPI)
	mux.HandleFunc("GET /api/products", a.listProducts)
	mux.HandleFunc("GET /api/products/{id}", a.getProduct)
	mux.HandleFunc("POST /api/orders", a.createOrder)
	mux.HandleFunc("GET /api/orders/{folio}", a.getOrder)
	mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		writeError(w, http.StatusNotFound, "ruta no encontrada")
	})

	mux.Handle("/", siteHandler(cfg.SiteDir))

	return a.recoverer(a.logger(mux))
}

func (a *API) health(w http.ResponseWriter, r *http.Request) {
	res := map[string]string{"status": "ok", "storage": a.cfg.Storage, "time": time.Now().Format(time.RFC3339)}
	status := http.StatusOK
	if a.cfg.Ping != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := a.cfg.Ping(ctx); err != nil {
			a.log.Error("base de datos sin respuesta", "err", err)
			res["status"], res["database"] = "error", "sin respuesta"
			status = http.StatusServiceUnavailable
		} else {
			res["database"] = "ok"
		}
	}
	writeJSON(w, status, res)
}

func (a *API) listProducts(w http.ResponseWriter, r *http.Request) {
	ps, err := a.shop.Products(r.Context())
	if err != nil {
		a.internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, ps)
}

func (a *API) getProduct(w http.ResponseWriter, r *http.Request) {
	p, err := a.shop.Product(r.Context(), r.PathValue("id"))
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "producto no encontrado")
		return
	}
	if err != nil {
		a.internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, p)
}

func (a *API) createOrder(w http.ResponseWriter, r *http.Request) {
	var req shop.OrderRequest
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxBodyBytes))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "JSON inválido: "+err.Error())
		return
	}

	o, err := a.shop.PlaceOrder(r.Context(), req)
	var verr *shop.ValidationError
	switch {
	case errors.As(err, &verr):
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"error": "datos inválidos", "fields": verr.Fields})
	case errors.Is(err, store.ErrInsufficientStock):
		writeError(w, http.StatusConflict, err.Error())
	case err != nil:
		a.internal(w, err)
	default:
		a.log.Info("pedido creado", "folio", o.Folio, "total", o.TotalCents)
		writeJSON(w, http.StatusCreated, o)
	}
}

func (a *API) getOrder(w http.ResponseWriter, r *http.Request) {
	o, err := a.shop.Order(r.Context(), r.PathValue("folio"))
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "pedido no encontrado")
		return
	}
	if err != nil {
		a.internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, o)
}

func (a *API) internal(w http.ResponseWriter, err error) {
	a.log.Error("error interno", "err", err)
	writeError(w, http.StatusInternalServerError, "error interno")
}

// siteHandler sirve solo las páginas .html de la raíz y la carpeta assets/,
// para no exponer docs/, server/ ni .git.
func siteHandler(dir string) http.Handler {
	files := http.FileServer(http.Dir(dir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := r.URL.Path
		allowed := p == "/" ||
			strings.HasPrefix(p, "/assets/") ||
			(strings.HasSuffix(p, ".html") && !strings.Contains(strings.TrimPrefix(p, "/"), "/"))
		if !allowed {
			http.NotFound(w, r)
			return
		}
		if p == "/" {
			if _, err := os.Stat(filepath.Join(dir, "index.html")); err != nil {
				http.NotFound(w, r)
				return
			}
		}
		files.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

func (a *API) logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)
		if strings.HasPrefix(r.URL.Path, "/api/") {
			a.log.Info("http", "method", r.Method, "path", r.URL.Path, "status", rec.status, "dur", time.Since(start).String())
		}
	})
}

func (a *API) recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if v := recover(); v != nil {
				a.log.Error("panic", "value", v, "path", r.URL.Path)
				writeError(w, http.StatusInternalServerError, "error interno")
			}
		}()
		next.ServeHTTP(w, r)
	})
}
