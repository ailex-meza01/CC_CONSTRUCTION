SET NOCOUNT ON;

IF OBJECT_ID('dbo.Projects', 'U') IS NULL
CREATE TABLE dbo.Projects (
  id INT IDENTITY(1,1) PRIMARY KEY, name NVARCHAR(160) NOT NULL UNIQUE,
  location NVARCHAR(160) NOT NULL, manager NVARCHAR(120) NOT NULL,
  status NVARCHAR(40) NOT NULL, progress INT NOT NULL DEFAULT 0,
  budget DECIMAL(18,2) NOT NULL DEFAULT 0, deadline DATE NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID('dbo.Employees', 'U') IS NULL
CREATE TABLE dbo.Employees (
  id INT IDENTITY(1,1) PRIMARY KEY, full_name NVARCHAR(140) NOT NULL UNIQUE,
  position NVARCHAR(100) NOT NULL, project_name NVARCHAR(160) NULL,
  status NVARCHAR(40) NOT NULL, created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID('dbo.Materials', 'U') IS NULL
CREATE TABLE dbo.Materials (
  id INT IDENTITY(1,1) PRIMARY KEY, name NVARCHAR(160) NOT NULL,
  movement_type NVARCHAR(40) NOT NULL, quantity NVARCHAR(80) NOT NULL,
  destination NVARCHAR(160) NOT NULL, created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID('dbo.Incidents', 'U') IS NULL
CREATE TABLE dbo.Incidents (
  id INT IDENTITY(1,1) PRIMARY KEY, description NVARCHAR(300) NOT NULL,
  priority NVARCHAR(40) NOT NULL, project_name NVARCHAR(160) NOT NULL,
  evidence_count INT NOT NULL DEFAULT 0, created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID('dbo.ProgressUpdates', 'U') IS NULL
CREATE TABLE dbo.ProgressUpdates (
  id INT IDENTITY(1,1) PRIMARY KEY, project_name NVARCHAR(160) NOT NULL,
  phase NVARCHAR(120) NOT NULL, percent_complete INT NOT NULL,
  notes NVARCHAR(400) NOT NULL, reported_on DATE NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID('dbo.Reports', 'U') IS NULL
CREATE TABLE dbo.Reports (
  id INT IDENTITY(1,1) PRIMARY KEY, title NVARCHAR(180) NOT NULL,
  report_type NVARCHAR(80) NOT NULL, period_label NVARCHAR(80) NOT NULL,
  metric_value DECIMAL(18,2) NOT NULL, metric_unit NVARCHAR(40) NOT NULL,
  status NVARCHAR(40) NOT NULL, created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT 1 FROM dbo.Projects)
INSERT dbo.Projects (name,location,manager,status,progress,budget,deadline) VALUES
('Cedar Ridge Residences','Austin, TX','Sofia Martinez','In progress',68,1850000,'2026-11-20'),
('Lakeview Townhomes','Dallas, TX','Mark Rivers','In progress',42,2420000,'2027-02-15'),
('Oak Street Offices','Fort Worth, TX','Daniel Kim','Inspection',91,980000,'2026-08-30'),
('Sunset Retail Center','Plano, TX','Priya Shah','Scheduled',12,1375000,'2027-04-10'),
('Riverbend Apartments','San Antonio, TX','Sofia Martinez','In progress',55,3100000,'2027-01-25'),
('Northgate Warehouse','Arlington, TX','Mark Rivers','In progress',76,1650000,'2026-10-12'),
('Willow Creek Homes','Frisco, TX','Ellen Brooks','Scheduled',20,2250000,'2027-05-01'),
('Downtown Medical Suites','Houston, TX','Daniel Kim','Inspection',88,1940000,'2026-09-18'),
('Pine Valley School','McKinney, TX','Priya Shah','In progress',61,4200000,'2027-03-08'),
('Heritage Community Hall','Irving, TX','Sofia Martinez','In progress',34,860000,'2026-12-14');

IF NOT EXISTS (SELECT 1 FROM dbo.Employees)
INSERT dbo.Employees (full_name,position,project_name,status) VALUES
('Carlos Mendoza','Site Superintendent','Cedar Ridge Residences','Active'),('Ava Thompson','Project Engineer','Lakeview Townhomes','Active'),
('Luis Hernandez','Carpenter Foreman','Oak Street Offices','Active'),('Mia Collins','Safety Coordinator','Sunset Retail Center','Active'),
('Noah Williams','Electrician','Riverbend Apartments','Active'),('Emma Garcia','Equipment Operator','Northgate Warehouse','Active'),
('James Wilson','Plumber','Willow Creek Homes','On leave'),('Isabella Moore','Estimator','Downtown Medical Suites','Active'),
('Ethan Taylor','Concrete Foreman','Pine Valley School','Active'),('Sophia Anderson','Quality Inspector','Heritage Community Hall','Active');

IF (SELECT COUNT(*) FROM dbo.Materials) < 10
INSERT dbo.Materials (name,movement_type,quantity,destination) VALUES
('Structural lumber 2x6','Inbound','420 pieces','Cedar Ridge Residences'),('Ready-mix concrete','Assigned','96 yd3','Lakeview Townhomes'),
('Copper wiring 12/2','Outbound','38 rolls','Oak Street Offices'),('Drywall 5/8 in','Inbound','260 sheets','Sunset Retail Center'),
('Roofing shingles','Assigned','180 bundles','Riverbend Apartments'),('Steel I-beams','Inbound','24 units','Northgate Warehouse'),
('PEX tubing','Outbound','1,200 ft','Willow Creek Homes'),('Insulation R-30','Inbound','150 batts','Downtown Medical Suites'),
('CMU blocks 8 in','Assigned','2,400 blocks','Pine Valley School'),('Interior paint','Inbound','85 gallons','Heritage Community Hall');

IF NOT EXISTS (SELECT 1 FROM dbo.Incidents)
INSERT dbo.Incidents (description,priority,project_name,evidence_count) VALUES
('Minor hand-tool injury during framing','Medium','Cedar Ridge Residences',3),('Concrete delivery arrived outside scheduled window','Low','Lakeview Townhomes',1),
('Temporary guardrail required replacement','High','Oak Street Offices',4),('Water intrusion found near loading bay','Medium','Sunset Retail Center',5),
('Damaged shingle pallets received','Low','Riverbend Apartments',2),('Forklift near-miss in staging zone','High','Northgate Warehouse',3),
('Underground utility marking discrepancy','High','Willow Creek Homes',6),('Dust-control barrier failure','Medium','Downtown Medical Suites',2),
('Scaffold inspection tag expired','High','Pine Valley School',4),('Noise complaint from adjacent property','Low','Heritage Community Hall',1);

IF NOT EXISTS (SELECT 1 FROM dbo.ProgressUpdates)
INSERT dbo.ProgressUpdates (project_name,phase,percent_complete,notes,reported_on) VALUES
('Cedar Ridge Residences','Framing',68,'Second-floor framing and shear walls underway','2026-07-14'),('Lakeview Townhomes','Foundations',42,'Building C slab poured','2026-07-13'),
('Oak Street Offices','Final inspection',91,'MEP punch list reduced to twelve items','2026-07-12'),('Sunset Retail Center','Site preparation',12,'Erosion controls and layout complete','2026-07-11'),
('Riverbend Apartments','Envelope',55,'Windows installed in buildings A and B','2026-07-10'),('Northgate Warehouse','Roofing',76,'Roof membrane is weather-tight','2026-07-09'),
('Willow Creek Homes','Permitting',20,'Civil revisions submitted to city','2026-07-08'),('Downtown Medical Suites','Commissioning',88,'HVAC balancing in progress','2026-07-07'),
('Pine Valley School','Masonry',61,'Gymnasium CMU walls topped out','2026-07-06'),('Heritage Community Hall','Rough-in',34,'Electrical and plumbing rough-in started','2026-07-05');

IF NOT EXISTS (SELECT 1 FROM dbo.Reports)
INSERT dbo.Reports (title,report_type,period_label,metric_value,metric_unit,status) VALUES
('Portfolio completion','Progress','July 2026',54.70,'percent','Current'),('Committed project budget','Financial','Q3 2026',20625000,'USD','Current'),
('Active workforce','Workforce','Week 29',9,'people','Current'),('Safety incidents','Safety','July 2026',10,'events','Review'),
('High priority incidents','Safety','July 2026',4,'events','Action needed'),('Inbound material loads','Materials','Week 29',5,'loads','Current'),
('Crew assignment rate','Productivity','Week 29',100,'percent','Current'),('Projects on schedule','Schedule','July 2026',8,'projects','Current'),
('Open punch-list items','Quality','Week 29',37,'items','Review'),('Forecast variance','Financial','Q3 2026',2.8,'percent','Current');
GO
