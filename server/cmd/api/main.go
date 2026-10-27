// Comando api: levanta el servidor de Mil Sensaciones.
//
//	go run ./cmd/api              (desde la carpeta server/)
//
// Lee la configuración de variables de entorno y, si existe, del archivo .env:
//
//	PORT          puerto HTTP (por defecto 8080)
//	SITE_DIR      carpeta con los .html y assets/ (por defecto "../frontend")
//	DATABASE_URL  conexión a PostgreSQL; si está vacía, los datos se guardan en memoria
package main

import (
	"bufio"
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"milsensaciones/server/internal/api"
	"milsensaciones/server/internal/db"
	"milsensaciones/server/internal/shop"
	"milsensaciones/server/internal/store"
)

func main() {
	log := slog.New(slog.NewTextHandler(os.Stdout, nil))
	if err := loadDotEnv(".env"); err != nil {
		log.Error("no se pudo leer .env", "err", err)
		os.Exit(1)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	port := env("PORT", "8080")
	cfg := api.Config{SiteDir: env("SITE_DIR", "../frontend"), Log: log, Storage: "memory"}

	var st store.Store
	if url := os.Getenv("DATABASE_URL"); url != "" {
		pool, err := db.Open(ctx, url)
		if err != nil {
			log.Error("base de datos", "err", err)
			os.Exit(1)
		}
		defer pool.Close()
		if err := db.Migrate(ctx, pool, log); err != nil {
			log.Error("migraciones", "err", err)
			os.Exit(1)
		}
		st = store.NewPostgres(pool)
		cfg.Storage, cfg.Ping = "postgres", pool.Ping
	} else {
		log.Warn("DATABASE_URL vacía: los datos se guardan en memoria y se pierden al reiniciar")
		st = store.NewMemory(store.SeedProducts())
	}

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           api.NewRouter(shop.NewService(st), cfg),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Info("servidor escuchando",
			"sitio", "http://localhost:"+port,
			"docs", "http://localhost:"+port+"/api/docs",
			"storage", cfg.Storage)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("no se pudo iniciar", "err", err)
			os.Exit(1)
		}
	}()

	<-ctx.Done()
	log.Info("apagando servidor")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("apagado forzado", "err", err)
	}
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// loadDotEnv carga líneas CLAVE=valor sin pisar variables que ya existan.
// Si el archivo no existe no hace nada (en producción las pone systemd).
func loadDotEnv(path string) error {
	f, err := os.Open(path)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	defer f.Close()

	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		k, v = strings.TrimSpace(k), strings.Trim(strings.TrimSpace(v), `"'`)
		if _, exists := os.LookupEnv(k); !exists {
			os.Setenv(k, v)
		}
	}
	return sc.Err()
}
