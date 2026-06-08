# StockVelia - Sistema de Gestión de Inventario Multiempresa para Microempresas

StockVelia es una plataforma de software diseñada bajo el modelo SaaS (Software como Servicio) que permite a múltiples microempresas administrar de manera independiente, segura y centralizada sus existencias, el control de accesos de su personal y la trazabilidad total de su mercancía.

## 📋 Resumen Ejecutivo del Proyecto

El proyecto resuelve la falta de control operativo en los inventarios de los pequeños negocios, mitigando pérdidas económicas causadas por el desabastecimiento o el vencimiento no controlado de productos. A través de una arquitectura moderna, StockVelia automatiza el cálculo de existencias en tiempo real y ofrece un sistema blindado de seguridad y auditoría para que los dueños de negocio tengan la certeza absoluta de qué empleado realizó cada acción en el sistema.

### 🌐 Funcionamiento del Ecosistema (Flujo de Datos)
1. **Acceso y Registro**: Una empresa se registra en la plataforma. El sistema crea la empresa e introduce automáticamente a su primer usuario con el rol de **Administrador**. El backend encripta su contraseña de forma irreversible.
2. **Seguridad y Control de Sesión**: Al iniciar sesión, el servidor valida que el usuario no esté bloqueado (tras 5 intentos fallidos se congela la cuenta por 15 minutos). Si los datos son correctos, emite un **Token JWT** que el Frontend almacena. Cuando el usuario cierra sesión, el token se destruye enviándolo a una **Lista Negra (Blacklist)** en la base de datos para evitar su reutilización fraudulenta.
3. **Módulo de Inventario**: Los usuarios crean categorías y productos asociados únicamente a su empresa. Al registrar una **ENTRADA, SALIDA o BAJA**, el backend delega la lógica transaccional a la base de datos.
4. **Automatización (Trigger)**: Un disparador interno en PostgreSQL procesa el movimiento e incrementa o decrementa las existencias en milisegundos de forma transparente. Si un usuario intenta vender más de lo que hay en stock, la base de datos cancela la transacción mediante una excepción controlada, protegiendo la integridad del inventario.
5. **Auditoría e Historial**: Cada movimiento o inicio de sesión dispara un registro asíncrono en la tabla de auditoría, guardando la fecha exacta, la acción y el ID del operador para consultas de control de calidad.

## 🚀 Características Principales

* **Arquitectura Multiempresa**: Aislamiento total de datos; ninguna empresa puede visualizar el inventario ni los usuarios de otra.
* **Cálculo Automatizado de Stock**: Lógica de inventario delegada al motor de base de datos mediante Triggers y Funciones de PostgreSQL.
* **Alertas de Stock Mínimo**: Filtros automatizados para detectar artículos por debajo del límite de seguridad.
* **Protección Antihackeo**: Autenticación por Tokens JWT y contraseñas cifradas con algoritmos de derivación de claves de alta resistencia (Bcrypt).
* **Flujo Automático de Recuperación**: Envío dinámico de códigos numéricos de 6 dígitos que expiran en 15 minutos a través de un servidor SMTP.
* **Trazabilidad de Auditoría**: Bitácora imborrable de las operaciones del sistema (Creación, Modificación, Eliminación y Login).

## 🛠️ Tecnologías Utilizadas

* **Frontend**: React (JavaScript, CSS3, HTML5) con manejo de sesiones en almacenamiento local.
* **Backend**: Node.js y Express utilizando la arquitectura limpia Modelo-Controlador-Ruta y módulos ES6 nativos.
* **Base de Datos**: PostgreSQL con restricciones de integridad de datos avanzadas (`CHECK`, `FOREIGN KEYS` en cascada).
* **Seguridad y Encriptación**: JWT (JSON Web Tokens) y Bcrypt.
* **Servicio Postal**: Nodemailer acoplado a la API segura de aplicaciones de Google (Gmail).

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com
   cd backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar el entorno (`.env`):**
   Crea un archivo `.env` en la raíz de la carpeta `backend` con la siguiente estructura:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stockvelia_db
   JWT_SECRET=clave_segura_para_los_tokens_de_stockvelia
   EMAIL_USER=soporte.stockvelia@gmail.com
   EMAIL_PASS=tu_contraseña_de_aplicacion_de_gmail
   ```

4. **Arrancar el servidor:**
   ```bash
   npm run dev
   ```

## 📋 Requisitos Previos

* Node.js v24.15.0 o superior.
* Servidor PostgreSQL v15 o superior configurado localmente.

## ✒️ Autores

* **Jaider Andrés González Ovalle** - *Desarrollo Backend, Arquitectura de la API e Integración de Base de Datos*
* **Ivonne Dayana Sanchez Contreras** - *Documentación del Sistema, Análisis de Requerimientos y Control de Calidad (QA)*
* **Alan Felipe Caro Olaya** - *Diseño del Modelo Relacional, Funciones y Automatización por Triggers SQL*
* **Jonathan Andres Jimenez Aguilera** - *Desarrollo Frontend en React, Consumo de APIs y UI/UX de las Pantallas*
