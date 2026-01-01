-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyMenuLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "studentId" TEXT NOT NULL,
    "nasi" BOOLEAN NOT NULL DEFAULT false,
    "lauk" BOOLEAN NOT NULL DEFAULT false,
    "sayur" BOOLEAN NOT NULL DEFAULT false,
    "buah" BOOLEAN NOT NULL DEFAULT false,
    "minum" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    CONSTRAINT "DailyMenuLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BreakfastEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BreakfastAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "breakfastEventId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "isPresent" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BreakfastAttendance_breakfastEventId_fkey" FOREIGN KEY ("breakfastEventId") REFERENCES "BreakfastEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BreakfastAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMenuLog_studentId_date_key" ON "DailyMenuLog"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BreakfastEvent_date_key" ON "BreakfastEvent"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BreakfastAttendance_breakfastEventId_studentId_key" ON "BreakfastAttendance"("breakfastEventId", "studentId");
