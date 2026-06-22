IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Users (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
    full_name NVARCHAR(140) NOT NULL,
    email NVARCHAR(180) NOT NULL,
    password_hash VARCHAR(64) NOT NULL,
    role NVARCHAR(40) NOT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_Users_is_active DEFAULT (1),
    created_at DATETIME2(7) NOT NULL CONSTRAINT DF_Users_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT UQ_Users_email UNIQUE (email),
    CONSTRAINT CK_Users_role CHECK (role IN ('Administrator', 'Project Manager', 'Field Crew'))
  );
END;
GO

MERGE dbo.Users AS target
USING (
  VALUES
    (
      N'Sofia Martinez',
      N'admin@ccconstruction.us',
      CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', CONVERT(VARCHAR(200), 'construction2026')), 2),
      N'Administrator'
    ),
    (
      N'Mark Rivers',
      N'pm@ccconstruction.us',
      CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', CONVERT(VARCHAR(200), 'construction2026')), 2),
      N'Project Manager'
    ),
    (
      N'Ellen Brooks',
      N'crew@ccconstruction.us',
      CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', CONVERT(VARCHAR(200), 'construction2026')), 2),
      N'Field Crew'
    )
) AS source (full_name, email, password_hash, role)
ON target.email = source.email
WHEN MATCHED THEN
  UPDATE SET
    full_name = source.full_name,
    password_hash = source.password_hash,
    role = source.role,
    is_active = 1
WHEN NOT MATCHED THEN
  INSERT (full_name, email, password_hash, role)
  VALUES (source.full_name, source.email, source.password_hash, source.role);
GO
