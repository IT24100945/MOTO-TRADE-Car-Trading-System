CREATE DATABASE MotoTradeDB;
GO
USE MotoTradeDB;
GO

CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) DEFAULT 'Buyer', -- 'Seller' or 'Buyer'
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Vehicles (
    id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    brand NVARCHAR(100) NOT NULL,
    model NVARCHAR(100) NOT NULL,
    year INT NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    mileage INT NOT NULL,
    fuelType NVARCHAR(50) NOT NULL,
    transmission NVARCHAR(50) NOT NULL,
    condition NVARCHAR(50) NOT NULL,
    district NVARCHAR(100) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    availabilityStatus NVARCHAR(20) DEFAULT 'Available', -- 'Available' or 'Sold'
    sellerId INT NOT NULL FOREIGN KEY REFERENCES Users(id),
    videoUrl NVARCHAR(255),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE VehicleImages (
    id INT PRIMARY KEY IDENTITY(1,1),
    vehicleId INT NOT NULL FOREIGN KEY REFERENCES Vehicles(id) ON DELETE CASCADE,
    imageUrl NVARCHAR(255) NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Indexes for fast searching and filtering
CREATE INDEX IX_Vehicles_Brand ON Vehicles(brand);
CREATE INDEX IX_Vehicles_Price ON Vehicles(price);
CREATE INDEX IX_Vehicles_Year ON Vehicles(year);
CREATE INDEX IX_Vehicles_City on Vehicles(city);
CREATE INDEX IX_Vehicles_Brand_Model ON Vehicles(brand, model);
