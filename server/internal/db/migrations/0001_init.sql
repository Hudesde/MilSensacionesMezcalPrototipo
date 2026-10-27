-- Catálogo, pedidos y folios.

CREATE TABLE products (
    id           TEXT PRIMARY KEY,
    name         TEXT        NOT NULL,
    price_cents  BIGINT      NOT NULL CHECK (price_cents >= 0),
    stock        INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image        TEXT        NOT NULL DEFAULT '',
    abv          TEXT        NOT NULL DEFAULT '',
    description  TEXT        NOT NULL DEFAULT '',
    active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id                BIGSERIAL PRIMARY KEY,
    folio             TEXT        NOT NULL UNIQUE,
    status            TEXT        NOT NULL DEFAULT 'orden_recibida' CHECK (status IN (
                          'orden_recibida', 'pago_pendiente', 'pago_confirmado',
                          'en_empaque', 'en_transito', 'entregado', 'cancelado')),
    customer_name     TEXT        NOT NULL,
    customer_phone    TEXT        NOT NULL,
    customer_email    TEXT        NOT NULL,
    customer_address  TEXT        NOT NULL,
    total_cents       BIGINT      NOT NULL CHECK (total_cents >= 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX orders_status_idx ON orders (status);

CREATE TABLE order_items (
    id                BIGSERIAL PRIMARY KEY,
    order_id          BIGINT  NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id        TEXT    NOT NULL REFERENCES products (id),
    name              TEXT    NOT NULL,
    qty               INTEGER NOT NULL CHECK (qty > 0),
    unit_price_cents  BIGINT  NOT NULL CHECK (unit_price_cents >= 0),
    subtotal_cents    BIGINT  NOT NULL CHECK (subtotal_cents >= 0)
);

CREATE INDEX order_items_order_id_idx ON order_items (order_id);

-- Consecutivo de folio por año: MS-2026-0001, MS-2026-0002, ...
CREATE TABLE folio_counters (
    year  INTEGER PRIMARY KEY,
    last  INTEGER NOT NULL
);

-- Datos provisionales del prototipo; el cliente los confirma (SRS, Sección 6).
INSERT INTO products (id, name, price_cents, stock, image, abv, description) VALUES
    ('espadin',   'Mezcal Espadín Joven 750ml', 85000,  120, 'assets/img/botellasPrimerPlano/espadin/EspadinPP02.jpeg', '45% Alc. Vol.', 'Agave Angustifolia Haw, cocido en horno cónico de tierra.'),
    ('ensamble',  'Ensamble de Agaves 750ml',   125000, 60,  'assets/img/botellasPrimerPlano/Ensamble.jpeg',           '47% Alc. Vol.', 'Micro-lote con co-cocción y co-fermentación de varios agaves.'),
    ('silvestre', 'Mezcal Silvestre 750ml',     145000, 40,  'assets/img/botellasPrimerPlano/Silvestre01.jpeg',         '48% Alc. Vol.', 'Agaves recolectados en los cerros de Yautepec.'),
    ('curados',   'Curados de Mezcal 750ml',    75000,  80,  'assets/img/botellasPrimerPlano/Curado01.jpeg',            '38% Alc. Vol.', 'Maceración natural con maracuyá y frutas de temporada.');
