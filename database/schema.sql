-- Esquema para una base nueva. No contiene cuentas ni información personal.
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    Activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'administrador') NOT NULL DEFAULT 'cliente',
    Activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS productos (
    id_producto INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    descuento DECIMAL(5,2) NOT NULL DEFAULT 0,
    imagen VARCHAR(100) NOT NULL DEFAULT 'imagen1.jpg',
    Activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_productos_categoria (id_categoria),
    CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria)
        REFERENCES categorias (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    estado ENUM('Pendiente', 'En proceso', 'Enviado', 'Entregado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
    Activo TINYINT(1) NOT NULL DEFAULT 1,
    INDEX idx_pedidos_usuario (id_usuario),
    INDEX idx_pedidos_fecha (fecha),
    CONSTRAINT fk_pedidos_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_detalle INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    INDEX idx_detalle_pedido (id_pedido),
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedidos (id_pedido),
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto)
        REFERENCES productos (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contacto (
    id_contacto INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO categorias (id_categoria, nombre, Activo) VALUES
    (1, 'Deportivas', 1),
    (2, 'Casuales', 1),
    (3, 'Premium', 1);

INSERT INTO productos (id_categoria, nombre, marca, precio, stock, descuento, imagen, Activo)
SELECT 1, 'Air Max Urbana', 'Nike', 180000, 12, 0, 'imagen4.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Air Max Urbana');
INSERT INTO productos (id_categoria, nombre, marca, precio, stock, descuento, imagen, Activo)
SELECT 2, 'Superstar Clásica', 'Adidas', 150000, 10, 5, 'imagen2.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Superstar Clásica');
INSERT INTO productos (id_categoria, nombre, marca, precio, stock, descuento, imagen, Activo)
SELECT 3, 'Jordan Retro', 'Jordan', 220000, 6, 0, 'imagen12.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jordan Retro');
