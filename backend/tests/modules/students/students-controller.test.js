const {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent
} = require("../../../src/modules/students/students-controller");

const {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent
} = require("../../../src/modules/students/students-service");

const { ApiError } = require("../../../src/utils");

jest.mock("../../../src/modules/students/students-service");

describe("Student Controller", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {},
            user: { id: 1, role: "admin" }
        };

        res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };

        next = jest.fn();
    });

    describe("handleGetAllStudents", () => {
        describe("Positive Test Cases", () => {
            test("should return students with valid query parameters", async () => {
                const mockStudents = [
                    {
                        id: 1,
                        name: "John Doe",
                        email: "john@example.com",
                        systemAccess: true
                    },
                    {
                        id: 2,
                        name: "Jane Smith",
                        email: "jane@example.com",
                        systemAccess: true
                    }
                ];

                getAllStudents.mockResolvedValue(mockStudents);

                req.query = { name: "John" };

                await handleGetAllStudents(req, res, next);

                expect(getAllStudents).toHaveBeenCalledWith({ name: "John", className: undefined, section: undefined, roll: undefined });
                expect(res.json).toHaveBeenCalledWith({ students: mockStudents });
            });

            test("should return all students without filter", async () => {
                const mockStudents = [
                    { id: 1, name: "John Doe", email: "john@example.com", systemAccess: true },
                    { id: 2, name: "Jane Smith", email: "jane@example.com", systemAccess: true }
                ];

                getAllStudents.mockResolvedValue(mockStudents);

                await handleGetAllStudents(req, res, next);

                expect(getAllStudents).toHaveBeenCalledWith({
                    name: undefined,
                    className: undefined,
                    section: undefined,
                    roll: undefined
                });
                expect(res.json).toHaveBeenCalledWith({ students: mockStudents });
            });

            test("should filter students by className", async () => {
                const mockStudents = [
                    { id: 1, name: "John Doe", email: "john@example.com", systemAccess: true, class: "Grade 10" }
                ];

                getAllStudents.mockResolvedValue(mockStudents);
                req.query = { className: "Grade 10" };

                await handleGetAllStudents(req, res, next);

                expect(getAllStudents).toHaveBeenCalledWith({
                    name: undefined,
                    className: "Grade 10",
                    section: undefined,
                    roll: undefined
                });
                expect(res.json).toHaveBeenCalledWith({ students: mockStudents });
            });

            test("should filter students by section", async () => {
                const mockStudents = [
                    { id: 1, name: "John Doe", email: "john@example.com", systemAccess: true, section: "A" }
                ];

                getAllStudents.mockResolvedValue(mockStudents);
                req.query = { section: "A" };

                await handleGetAllStudents(req, res, next);

                expect(getAllStudents).toHaveBeenCalledWith({
                    name: undefined,
                    className: undefined,
                    section: "A",
                    roll: undefined
                });
                expect(res.json).toHaveBeenCalledWith({ students: mockStudents });
            });

            test("should filter students by roll number", async () => {
                const mockStudents = [
                    { id: 1, name: "John Doe", email: "john@example.com", systemAccess: true, roll: 101 }
                ];

                getAllStudents.mockResolvedValue(mockStudents);
                req.query = { roll: "101" };

                await handleGetAllStudents(req, res, next);

                expect(getAllStudents).toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({ students: mockStudents });
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error when no students found", async () => {
                getAllStudents.mockRejectedValue(new ApiError(404, "Students not found"));

                await handleGetAllStudents(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
                expect(getAllStudents).toHaveBeenCalled();
            });

            test("should handle database errors", async () => {
                const error = new Error("Database connection failed");
                getAllStudents.mockRejectedValue(error);

                await handleGetAllStudents(req, res, next);
                expect(next).toHaveBeenCalledWith(error);
            });
        });

        describe("Edge Test Cases", () => {
            test("should handle special characters in search query", async () => {
                const mockStudents = [];
                getAllStudents.mockResolvedValue([]);

                req.query = { name: "O'Brien" };

                await handleGetAllStudents(req, res, next);

                expect(getAllStudents).toHaveBeenCalledWith({
                    name: "O'Brien",
                    className: undefined,
                    section: undefined,
                    roll: undefined
                });
            });

            test("should handle multiple filters simultaneously", async () => {
                const mockStudents = [{ id: 1, name: "John Doe", email: "john@example.com" }];
                getAllStudents.mockResolvedValue(mockStudents);

                req.query = { name: "John", className: "Grade 10", section: "A", roll: "101" };

                await handleGetAllStudents(req, res, next);

                expect(getAllStudents).toHaveBeenCalledWith({
                    name: "John",
                    className: "Grade 10",
                    section: "A",
                    roll: "101"
                });
            });
        });
    });

    describe("handleGetStudentDetail", () => {
        describe("Positive Test Cases", () => {
            test("should return student detail with valid ID", async () => {
                const mockStudent = {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "9876543210",
                    dob: "2005-01-15",
                    class: "Grade 10",
                    section: "A",
                    roll: 101
                };

                getStudentDetail.mockResolvedValue(mockStudent);
                req.params = { id: "1" };

                await handleGetStudentDetail(req, res, next);

                expect(getStudentDetail).toHaveBeenCalledWith("1");
                expect(res.json).toHaveBeenCalledWith(mockStudent);
            });

            test("should include all profile fields in response", async () => {
                const mockStudent = {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "9876543210",
                    gender: "Male",
                    dob: "2005-01-15",
                    class: "Grade 10",
                    section: "A",
                    roll: 101,
                    fatherName: "Robert Doe",
                    fatherPhone: "9876543211",
                    motherName: "Mary Doe",
                    motherPhone: "9876543212",
                    guardianName: "Robert Doe",
                    guardianPhone: "9876543211",
                    relationOfGuardian: "Father",
                    currentAddress: "123 Main St",
                    permanentAddress: "123 Main St",
                    admissionDate: "2023-01-15"
                };

                getStudentDetail.mockResolvedValue(mockStudent);
                req.params = { id: "1" };

                await handleGetStudentDetail(req, res, next);

                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    fatherName: "Robert Doe",
                    motherName: "Mary Doe",
                    guardianName: "Robert Doe",
                    currentAddress: "123 Main St",
                    permanentAddress: "123 Main St"
                }));
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error when student not found", async () => {
                getStudentDetail.mockRejectedValue(new ApiError(404, "Student not found"));
                req.params = { id: "999" };

                await handleGetStudentDetail(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
                expect(getStudentDetail).toHaveBeenCalledWith("999");
            });

            test("should handle invalid student ID", async () => {
                const error = new ApiError(400, "Invalid student ID");
                getStudentDetail.mockRejectedValue(error);
                req.params = { id: "invalid" };

                await handleGetStudentDetail(req, res, next);
                expect(next).toHaveBeenCalledWith(error);
            });
        });

        describe("Edge Test Cases", () => {
            test("should handle student with minimal profile data", async () => {
                const mockStudent = {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com"
                };

                getStudentDetail.mockResolvedValue(mockStudent);
                req.params = { id: "1" };

                await handleGetStudentDetail(req, res, next);

                expect(res.json).toHaveBeenCalledWith(mockStudent);
            });

            test("should handle student with very large ID", async () => {
                const mockStudent = { id: 999999999, name: "Test Student" };
                getStudentDetail.mockResolvedValue(mockStudent);
                req.params = { id: "999999999" };

                await handleGetStudentDetail(req, res, next);

                expect(getStudentDetail).toHaveBeenCalledWith("999999999");
            });
        });
    });

    describe("handleAddStudent", () => {
        describe("Positive Test Cases", () => {
            test("should create student with valid data", async () => {
                const studentData = {
                    name: "Jane Smith",
                    email: "jane@example.com",
                    phone: "9876543210",
                    gender: "Female",
                    dob: "2006-05-20",
                    className: "Grade 9",
                    sectionName: "B",
                    roll: 102,
                    fatherName: "John Smith",
                    fatherPhone: "9876543211"
                };

                addNewStudent.mockResolvedValue({
                    message: "Student added and verification email sent successfully."
                });

                req.body = studentData;

                await handleAddStudent(req, res, next);

                expect(addNewStudent).toHaveBeenCalledWith(studentData);
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith({
                    message: "Student added and verification email sent successfully."
                });
            });

            test("should handle successful student creation with partial data", async () => {
                const studentData = {
                    name: "Jane Smith",
                    email: "jane@example.com"
                };

                addNewStudent.mockResolvedValue({
                    message: "Student added and verification email sent successfully."
                });

                req.body = studentData;

                await handleAddStudent(req, res, next);

                expect(res.status).toHaveBeenCalledWith(201);
            });

            test("should handle email send failure gracefully", async () => {
                const studentData = {
                    name: "Jane Smith",
                    email: "jane@example.com"
                };

                addNewStudent.mockResolvedValue({
                    message: "Student added, but failed to send verification email."
                });

                req.body = studentData;

                await handleAddStudent(req, res, next);

                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith({
                    message: "Student added, but failed to send verification email."
                });
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error for duplicate email", async () => {
                const studentData = {
                    name: "Jane Smith",
                    email: "existing@example.com"
                };

                addNewStudent.mockRejectedValue(new ApiError(400, "Email already exists"));
                req.body = studentData;

                await handleAddStudent(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });

            test("should throw error when required fields are missing", async () => {
                const studentData = {
                    name: "Jane Smith"
                };

                addNewStudent.mockRejectedValue(new ApiError(400, "Email is required"));
                req.body = studentData;

                await handleAddStudent(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });

            test("should throw error for invalid email format", async () => {
                const studentData = {
                    name: "Jane Smith",
                    email: "invalid-email"
                };

                addNewStudent.mockRejectedValue(new ApiError(400, "Invalid email format"));
                req.body = studentData;

                await handleAddStudent(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });

            test("should handle database insertion errors", async () => {
                const studentData = {
                    name: "Jane Smith",
                    email: "jane@example.com"
                };

                addNewStudent.mockRejectedValue(new ApiError(500, "Unable to add student"));
                req.body = studentData;

                await handleAddStudent(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });
        });

        describe("Edge Test Cases", () => {
            test("should handle student name with special characters", async () => {
                const studentData = {
                    name: "Jean-Paul O'Brien",
                    email: "jean@example.com"
                };

                addNewStudent.mockResolvedValue({
                    message: "Student added and verification email sent successfully."
                });

                req.body = studentData;

                await handleAddStudent(req, res, next);

                expect(addNewStudent).toHaveBeenCalledWith(studentData);
            });

            test("should handle very long names", async () => {
                const studentData = {
                    name: "A".repeat(255),
                    email: "long@example.com"
                };

                addNewStudent.mockResolvedValue({
                    message: "Student added and verification email sent successfully."
                });

                req.body = studentData;

                await handleAddStudent(req, res, next);

                expect(addNewStudent).toHaveBeenCalledWith(studentData);
            });

            test("should handle emails with special valid characters", async () => {
                const studentData = {
                    name: "Jane Smith",
                    email: "jane.smith+test@example.com"
                };

                addNewStudent.mockResolvedValue({
                    message: "Student added and verification email sent successfully."
                });

                req.body = studentData;

                await handleAddStudent(req, res, next);

                expect(addNewStudent).toHaveBeenCalledWith(studentData);
            });
        });
    });

    describe("handleUpdateStudent", () => {
        describe("Positive Test Cases", () => {
            test("should update student with valid data", async () => {
                const updateData = {
                    name: "Jane Smith Updated",
                    phone: "9876543220"
                };

                updateStudent.mockResolvedValue({
                    message: "Student updated successfully"
                });

                req.params = { id: "1" };
                req.body = updateData;

                await handleUpdateStudent(req, res, next);

                expect(updateStudent).toHaveBeenCalledWith({
                    ...updateData,
                    studentId: "1"
                });
                expect(res.json).toHaveBeenCalledWith({
                    message: "Student updated successfully"
                });
            });

            test("should update only specific fields", async () => {
                const updateData = {
                    name: "Jane Smith"
                };

                updateStudent.mockResolvedValue({
                    message: "Student updated successfully"
                });

                req.params = { id: "1" };
                req.body = updateData;

                await handleUpdateStudent(req, res, next);

                expect(updateStudent).toHaveBeenCalledWith({
                    name: "Jane Smith",
                    studentId: "1"
                });
            });

            test("should allow updating address fields", async () => {
                const updateData = {
                    currentAddress: "456 New St",
                    permanentAddress: "789 Old St"
                };

                updateStudent.mockResolvedValue({
                    message: "Student updated successfully"
                });

                req.params = { id: "1" };
                req.body = updateData;

                await handleUpdateStudent(req, res, next);

                expect(updateStudent).toHaveBeenCalledWith(expect.objectContaining({
                    currentAddress: "456 New St",
                    permanentAddress: "789 Old St"
                }));
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error when student not found", async () => {
                updateStudent.mockRejectedValue(new ApiError(404, "Student not found"));
                req.params = { id: "999" };
                req.body = { name: "Updated Name" };

                await handleUpdateStudent(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });

            test("should throw error for invalid email on update", async () => {
                const updateData = {
                    email: "invalid-email"
                };

                updateStudent.mockRejectedValue(new ApiError(400, "Invalid email format"));
                req.params = { id: "1" };
                req.body = updateData;

                await handleUpdateStudent(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });

            test("should handle database update errors", async () => {
                const updateData = {
                    name: "Updated Name"
                };

                updateStudent.mockRejectedValue(new ApiError(500, "Unable to update student"));
                req.params = { id: "1" };
                req.body = updateData;

                await handleUpdateStudent(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });
        });

        describe("Edge Test Cases", () => {
            test("should handle empty update payload", async () => {
                updateStudent.mockResolvedValue({
                    message: "Student updated successfully"
                });

                req.params = { id: "1" };
                req.body = {};

                await handleUpdateStudent(req, res, next);

                expect(updateStudent).toHaveBeenCalledWith({ studentId: "1" });
            });

            test("should handle null values in update", async () => {
                const updateData = {
                    phone: null
                };

                updateStudent.mockResolvedValue({
                    message: "Student updated successfully"
                });

                req.params = { id: "1" };
                req.body = updateData;

                await handleUpdateStudent(req, res, next);

                expect(updateStudent).toHaveBeenCalledWith({
                    phone: null,
                    studentId: "1"
                });
            });
        });
    });

    describe("handleStudentStatus", () => {
        describe("Positive Test Cases", () => {
            test("should activate student status", async () => {
                setStudentStatus.mockResolvedValue({
                    message: "Student status changed successfully"
                });

                req.params = { id: "1" };
                req.body = { status: true };
                req.user = { id: 2, role: "admin" };

                await handleStudentStatus(req, res, next);

                expect(setStudentStatus).toHaveBeenCalledWith({
                    userId: "1",
                    reviewerId: 2,
                    status: true
                });
                expect(res.json).toHaveBeenCalledWith({
                    message: "Student status changed successfully"
                });
            });

            test("should deactivate student status", async () => {
                setStudentStatus.mockResolvedValue({
                    message: "Student status changed successfully"
                });

                req.params = { id: "1" };
                req.body = { status: false };
                req.user = { id: 2, role: "admin" };

                await handleStudentStatus(req, res, next);

                expect(setStudentStatus).toHaveBeenCalledWith({
                    userId: "1",
                    reviewerId: 2,
                    status: false
                });
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error when student not found", async () => {
                setStudentStatus.mockRejectedValue(new ApiError(404, "Student not found"));
                req.params = { id: "999" };
                req.body = { status: true };
                req.user = { id: 2, role: "admin" };

                await handleStudentStatus(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });

            test("should throw error for invalid status value", async () => {
                setStudentStatus.mockRejectedValue(new ApiError(400, "Invalid status value"));
                req.params = { id: "1" };
                req.body = { status: "invalid" };
                req.user = { id: 2, role: "admin" };

                await handleStudentStatus(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });

            test("should throw error when unable to update status", async () => {
                setStudentStatus.mockRejectedValue(new ApiError(500, "Unable to disable student"));
                req.params = { id: "1" };
                req.body = { status: false };
                req.user = { id: 2, role: "admin" };

                await handleStudentStatus(req, res, next);
                expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            });
        });

        describe("Edge Test Cases", () => {
            test("should require reviewer information", async () => {
                setStudentStatus.mockResolvedValue({
                    message: "Student status changed successfully"
                });

                req.params = { id: "1" };
                req.body = { status: true };
                req.user = { id: 2, role: "admin" };

                await handleStudentStatus(req, res, next);

                expect(setStudentStatus).toHaveBeenCalledWith(
                    expect.objectContaining({
                        reviewerId: expect.any(Number)
                    })
                );
            });

            test("should handle boolean status values correctly", async () => {
                setStudentStatus.mockResolvedValue({
                    message: "Student status changed successfully"
                });

                req.params = { id: "1" };
                req.body = { status: true };
                req.user = { id: 2, role: "admin" };

                await handleStudentStatus(req, res, next);

                expect(setStudentStatus).toHaveBeenCalledWith({
                    userId: "1",
                    reviewerId: 2,
                    status: true
                });
            });
        });
    });
});
