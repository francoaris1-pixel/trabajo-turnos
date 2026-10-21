/* ============================================================
   Base de datos: Trabajo Turnos - Microsoft SQL Server
   Script de creación (sin credenciales reales)
   Compatible con SQL Server 2016+ (usa índices filtrados)
   ============================================================ */

/* Los índices filtrados exigen QUOTED_IDENTIFIER y ANSI_NULLS en ON al crear la tabla. */
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF DB_ID(N'TrabajoTurnos') IS NULL
BEGIN
    CREATE DATABASE TrabajoTurnos;
END;
GO

USE TrabajoTurnos;
GO

/* ---------- Tabla Usuarios ---------- */
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios (
        usuario_id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Usuarios PRIMARY KEY,
        email           NVARCHAR(150)     NOT NULL,
        contrasena_hash NVARCHAR(200)     NOT NULL,          -- bcrypt, nunca texto plano
        rol             NVARCHAR(20)      NOT NULL CONSTRAINT CK_Usuarios_Rol CHECK (rol IN (N'paciente', N'medico', N'admin')),
        creado_en       DATETIME2(0)      NOT NULL CONSTRAINT DF_Usuarios_Creado DEFAULT SYSUTCDATETIME()
    );

    CREATE UNIQUE INDEX UX_Usuarios_Email ON dbo.Usuarios (email);
END;
GO

/* ---------- Tabla Medicos ---------- */
IF OBJECT_ID(N'dbo.Medicos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Medicos (
        medico_id    INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Medicos PRIMARY KEY,
        usuario_id   INT               NOT NULL,
        nombre       NVARCHAR(100)     NOT NULL,
        apellido     NVARCHAR(100)     NOT NULL,
        matricula    NVARCHAR(20)      NOT NULL,
        especialidad NVARCHAR(100)     NOT NULL,
        telefono     NVARCHAR(20)      NULL,
        activo       BIT               NOT NULL CONSTRAINT DF_Medicos_Activo DEFAULT (1),
        CONSTRAINT FK_Medicos_Usuarios FOREIGN KEY (usuario_id) REFERENCES dbo.Usuarios (usuario_id) ON DELETE CASCADE,
        CONSTRAINT UX_Medicos_Usuario UNIQUE (usuario_id),
        CONSTRAINT UX_Medicos_Matricula UNIQUE (matricula)
    );
END;
GO

/* ---------- Tabla Pacientes ---------- */
IF OBJECT_ID(N'dbo.Pacientes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Pacientes (
        paciente_id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Pacientes PRIMARY KEY,
        usuario_id       INT               NOT NULL,
        nombre           NVARCHAR(100)     NOT NULL,
        apellido         NVARCHAR(100)     NOT NULL,
        dni              VARCHAR(8)        NOT NULL,          -- 7 u 8 dígitos, validado también en la app
        fecha_nacimiento DATE              NOT NULL,
        telefono         NVARCHAR(20)      NULL,
        CONSTRAINT FK_Pacientes_Usuarios FOREIGN KEY (usuario_id) REFERENCES dbo.Usuarios (usuario_id) ON DELETE CASCADE,
        CONSTRAINT UX_Pacientes_Usuario UNIQUE (usuario_id),
        CONSTRAINT UX_Pacientes_Dni UNIQUE (dni),
        CONSTRAINT CK_Pacientes_Dni CHECK (dni NOT LIKE '%[^0-9]%'),
        CONSTRAINT CK_Pacientes_FechaNac CHECK (fecha_nacimiento <= CAST(GETDATE() AS DATE))
    );
END;
GO

/* ---------- Tabla Turnos ---------- */
IF OBJECT_ID(N'dbo.Turnos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Turnos (
        turno_id   INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Turnos PRIMARY KEY,
        paciente_id INT              NOT NULL,
        medico_id   INT              NOT NULL,
        fecha      DATE              NOT NULL,
        hora       TIME(0)           NOT NULL,
        estado     NVARCHAR(15)      NOT NULL CONSTRAINT DF_Turnos_Estado DEFAULT (N'pendiente')
                       CONSTRAINT CK_Turnos_Estado CHECK (estado IN (N'pendiente', N'atendido', N'cancelado')),
        motivo     NVARCHAR(300)     NULL,
        creado_en  DATETIME2(0)      NOT NULL CONSTRAINT DF_Turnos_Creado DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Turnos_Pacientes FOREIGN KEY (paciente_id) REFERENCES dbo.Pacientes (paciente_id),
        CONSTRAINT FK_Turnos_Medicos   FOREIGN KEY (medico_id)   REFERENCES dbo.Medicos (medico_id),
        CONSTRAINT CK_Turnos_Fecha CHECK (fecha >= '2000-01-01')
    );

    /* Anti-duplicado: mismo médico no puede tener dos turnos en la misma fecha/hora.
       Filtrado: solo bloquea turnos activos (pendiente/atendido), los cancelados se pueden reasignar. */
    CREATE UNIQUE INDEX UX_Turnos_Medico_Fecha_Hora
        ON dbo.Turnos (medico_id, fecha, hora)
        WHERE estado IN (N'pendiente', N'atendido');

    /* Un paciente no puede reservar dos turnos a la misma fecha/hora */
    CREATE UNIQUE INDEX UX_Turnos_Paciente_Fecha_Hora
        ON dbo.Turnos (paciente_id, fecha, hora)
        WHERE estado IN (N'pendiente', N'atendido');

    CREATE INDEX IX_Turnos_Medico_Fecha ON dbo.Turnos (medico_id, fecha) INCLUDE (estado);
    CREATE INDEX IX_Turnos_Paciente     ON dbo.Turnos (paciente_id)      INCLUDE (estado);
END;
GO

/* ---------- Tabla Horarios (días y horas de atención por médico) ---------- */
IF OBJECT_ID(N'dbo.Horarios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Horarios (
        horario_id   INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Horarios PRIMARY KEY,
        medico_id    INT               NOT NULL,
        dias         NVARCHAR(120)     NOT NULL,          -- ej: 'Lunes a Viernes'
        hora_inicio  TIME(0)           NOT NULL,
        hora_fin     TIME(0)           NOT NULL,
        CONSTRAINT FK_Horarios_Medicos FOREIGN KEY (medico_id) REFERENCES dbo.Medicos (medico_id) ON DELETE CASCADE,
        CONSTRAINT CK_Horarios_Rango CHECK (hora_fin > hora_inicio)
    );

    CREATE INDEX IX_Horarios_Medico ON dbo.Horarios (medico_id);
END;
GO

/* ---------- Relación Paciente <-> Médico (PacienteMedico) ---------- */
IF OBJECT_ID(N'dbo.PacientesMedicos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PacientesMedicos (
        paciente_id        INT NOT NULL,
        medico_id          INT NOT NULL,
        es_medico_cabecera BIT NOT NULL CONSTRAINT DF_PacMed_Cabecera DEFAULT (0),
        asignado_en        DATETIME2(0) NOT NULL CONSTRAINT DF_PacMed_Asignado DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_PacientesMedicos PRIMARY KEY (paciente_id, medico_id),
        CONSTRAINT FK_PacMed_Paciente FOREIGN KEY (paciente_id) REFERENCES dbo.Pacientes (paciente_id) ON DELETE NO ACTION,
        CONSTRAINT FK_PacMed_Medico   FOREIGN KEY (medico_id)   REFERENCES dbo.Medicos (medico_id)   ON DELETE NO ACTION
    );
END;
GO

PRINT 'Base de datos TrabajoTurnos creada correctamente.';
GO
