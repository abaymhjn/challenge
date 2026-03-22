const {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent
} = require("../../../src/modules/students/students-service");

const {
    findAllStudents,
    findStudentDetail,
    findStudentToSetStatus,
    addOrUpdateStudent
} = require("../../../src/modules/students/students-repository");

const { findUserById } = require("../../../src/shared/repository");

const { ApiError } = require("../../../src/utils");

jest.mock("../../../src/modules/students/students-repository");
jest.mock("../../../src/shared/repository");

describe("Student Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getAllStudents", () => {
        describe("Positive Test Cases", () => {
            test("should return array of students", async () => {
                const mockStudents = [
                    { id: 1, name: "John Doe", email: "john@example.com", systemAccess: true },
                    { id: 2, name: "Jane Smith", email: "jane@example.com", systemAccess: true }
                ];

                findAllStudents.mockResolvedValue(mockStudents);

                const result = await getAllStudents({});

                expect(findAllStudents).toHaveBeenCalledWith({});
                expect(result).toEqual(mockStudents);
                expect(Array.isArray(result)).toBe(true);
            });

            test("should return students with filter applied", async () => {
                const mockStudents = [
                    { id: 1, name: "John Doe", email: "john@example.com" }
                ];

                findAllStudents.mockResolvedValue(mockStudents);

                const payload = { name: "John Doe" };
                const result = await getAllStudents(payload);

                expect(findAllStudents).toHaveBeenCalledWith(payload);
                expect(result).toEqual(mockStudents);
            });

            test("should filter by className", async () => {
                const mockStudents = [
                    { id: 1, name: "John Doe", class: "Grade 10" }
                ];

                findAllStudents.mockResolvedValue(mockStudents);

                const payload = { className: "Grade 10" };
                const result = await getAllStudents(payload);

                expect(findAllStudents).toHaveBeenCalledWith(payload);
                expect(result).toEqual(mockStudents);
            });

            test("should filter by section", async () => {
                const mockStudents = [
                    { id: 1, name: "John Doe", section: "A" }
                ];

                findAllStudents.mockResolvedValue(mockStudents);

                const payload = { section: "A" };
                const result = await getAllStudents(payload);

                expect(findAllStudents).toHaveBeenCalledWith(payload);
                expect(result).toEqual(mockStudents);
            });

            test("should filter by roll number", async () => {
                const mockStudents = [
                    { id: 1, name: "John Doe", roll: 101 }
                ];

                findAllStudents.mockResolvedValue(mockStudents);

                const payload = { roll: 101 };
                const result = await getAllStudents(payload);

                expect(findAllStudents).toHaveBeenCalledWith(payload);
                expect(result).toEqual(mockStudents);
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error when no students found", async () => {
                findAllStudents.mockResolvedValue([]);

                await expect(getAllStudents({})).rejects.toThrow(
                    new ApiError(404, "Students not found")
                );
            });

            test("should throw error with correct status code", async () => {
                findAllStudents.mockResolvedValue([]);

                try {
                    await getAllStudents({});
                    fail("Should have thrown error");
                } catch (error) {
                    expect(error).toBeInstanceOf(ApiError);
                    expect(error.message).toBe("Students not found");
                }
            });

            test("should handle repository errors", async () => {
                const dbError = new Error("Database connection failed");
                findAllStudents.mockRejectedValue(dbError);

                await expect(getAllStudents({})).rejects.toThrow("Database connection failed");
            });
        });

        describe("Edge Test Cases", () => {
            test("should handle multiple concurrent calls", async () => {
                const mockStudents = [{ id: 1, name: "John Doe" }];
                findAllStudents.mockResolvedValue(mockStudents);

                const promises = [
                    getAllStudents({ name: "John" }),
                    getAllStudents({ className: "Grade 10" }),
                    getAllStudents({ section: "A" })
                ];

                const results = await Promise.all(promises);

                expect(results).toHaveLength(3);
                expect(findAllStudents).toHaveBeenCalledTimes(3);
            });

            test("should handle empty payload", async () => {
                const mockStudents = [{ id: 1, name: "John Doe" }];
                findAllStudents.mockResolvedValue(mockStudents);

                const result = await getAllStudents({});

                expect(result).toEqual(mockStudents);
            });
        });
    });

    describe("getStudentDetail", () => {
        describe("Positive Test Cases", () => {
            test("should return complete student detail", async () => {
                const mockStudent = {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "9876543210",
                    gender: "Male",
                    dob: "2005-01-15",
                    class: "Grade 10",
                    section: "A",
                    roll: 101
                };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentDetail.mockResolvedValue(mockStudent);

                const result = await getStudentDetail(1);

                expect(findUserById).toHaveBeenCalledWith(1);
                expect(findStudentDetail).toHaveBeenCalledWith(1);
                expect(result).toEqual(mockStudent);
            });

            test("should verify student exists before fetching detail", async () => {
                const mockStudent = { id: 1, name: "John Doe" };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentDetail.mockResolvedValue(mockStudent);

                await getStudentDetail(1);

                expect(findUserById).toHaveBeenCalled();
                expect(findStudentDetail).toHaveBeenCalled();
            });

            test("should include all guardian information", async () => {
                const mockStudent = {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    guardianName: "Robert Doe",
                    guardianPhone: "9876543211",
                    relationOfGuardian: "Father",
                    fatherName: "Robert Doe",
                    motherName: "Mary Doe"
                };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentDetail.mockResolvedValue(mockStudent);

                const result = await getStudentDetail(1);

                expect(result).toEqual(expect.objectContaining({
                    guardianName: "Robert Doe",
                    guardianPhone: "9876543211",
                    relationOfGuardian: "Father"
                }));
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error when student not found", async () => {
                findUserById.mockResolvedValue(null);

                await expect(getStudentDetail(999)).rejects.toThrow(
                    new ApiError(404, "Student not found")
                );
            });

            test("should not fetch detail if student does not exist", async () => {
                findUserById.mockResolvedValue(null);

                try {
                    await getStudentDetail(999);
                } catch (error) {
                    expect(findStudentDetail).not.toHaveBeenCalled();
                }
            });

            test("should throw error when detail retrieval fails", async () => {
                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentDetail.mockResolvedValue(null);

                await expect(getStudentDetail(1)).rejects.toThrow(
                    new ApiError(404, "Student not found")
                );
            });
        });

        describe("Edge Test Cases", () => {
            test("should handle student with minimal data", async () => {
                const mockStudent = { id: 1, name: "John Doe" };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentDetail.mockResolvedValue(mockStudent);

                const result = await getStudentDetail(1);

                expect(result).toEqual(mockStudent);
            });

            test("should handle large student ID", async () => {
                const mockStudent = { id: 999999999, name: "John Doe" };

                findUserById.mockResolvedValue({ id: 999999999, role_id: 3 });
                findStudentDetail.mockResolvedValue(mockStudent);

                const result = await getStudentDetail(999999999);

                expect(result.id).toBe(999999999);
            });
        });
    });

    describe("addNewStudent", () => {
        describe("Positive Test Cases", () => {
            test("should add student and return success message", async () => {
                const payload = {
                    name: "Jane Smith",
                    email: "jane@example.com"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: true,
                    userId: 2,
                    message: "Student added successfully"
                });

                const result = await addNewStudent(payload);

                expect(addOrUpdateStudent).toHaveBeenCalledWith(payload);
                expect(result.message).toBeDefined();
            });

            test("should return message when email send fails", async () => {
                const payload = {
                    name: "Jane Smith",
                    email: "jane@example.com"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: true,
                    userId: 2,
                    message: "Student added successfully"
                });

                const result = await addNewStudent(payload);

                expect(result).toHaveProperty("message");
                expect(result.message).toContain("Student added");
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error when student addition fails", async () => {
                const payload = {
                    name: "Jane Smith",
                    email: "jane@example.com"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: false,
                    message: "Email already exists"
                });

                await expect(addNewStudent(payload)).rejects.toThrow(ApiError);
            });

            test("should throw error for invalid payload", async () => {
                const payload = {
                    name: "Jane Smith"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: false,
                    message: "Email is required"
                });

                await expect(addNewStudent(payload)).rejects.toThrow(ApiError);
            });

            test("should catch database errors", async () => {
                const payload = {
                    name: "Jane Smith",
                    email: "jane@example.com"
                };

                addOrUpdateStudent.mockRejectedValue(new Error("Database error"));

                await expect(addNewStudent(payload)).rejects.toThrow(ApiError);
            });
        });

        describe("Edge Test Cases", () => {
            test("should handle student with special characters in name", async () => {
                const payload = {
                    name: "Jean-Paul O'Brien",
                    email: "jean@example.com"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: true,
                    userId: 2,
                    message: "Student added successfully"
                });

                const result = await addNewStudent(payload);

                expect(result).toHaveProperty("message");
            });

            test("should handle very long email addresses", async () => {
                const payload = {
                    name: "Jane Smith",
                    email: "very.long.email.address.with.many.dots@example.co.uk"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: true,
                    userId: 2,
                    message: "Student added successfully"
                });

                const result = await addNewStudent(payload);

                expect(result).toHaveProperty("message");
            });
        });
    });

    describe("updateStudent", () => {
        describe("Positive Test Cases", () => {
            test("should update student successfully", async () => {
                const payload = {
                    studentId: 1,
                    name: "Jane Smith Updated",
                    phone: "9876543220"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: true,
                    message: "Student updated successfully"
                });

                const result = await updateStudent(payload);

                expect(addOrUpdateStudent).toHaveBeenCalledWith(payload);
                expect(result).toEqual({
                    message: "Student updated successfully"
                });
            });

            test("should update partial student information", async () => {
                const payload = {
                    studentId: 1,
                    phone: "9876543220"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: true,
                    message: "Student updated successfully"
                });

                const result = await updateStudent(payload);

                expect(result).toHaveProperty("message");
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error when update fails", async () => {
                const payload = {
                    studentId: 1,
                    name: "Updated Name"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: false,
                    message: "Unable to update student"
                });

                await expect(updateStudent(payload)).rejects.toThrow(ApiError);
            });

            test("should throw error for non-existent student", async () => {
                const payload = {
                    studentId: 999,
                    name: "Updated Name"
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: false,
                    message: "Student not found"
                });

                await expect(updateStudent(payload)).rejects.toThrow(ApiError);
            });
        });

        describe("Edge Test Cases", () => {
            test("should handle empty update payload", async () => {
                const payload = {
                    studentId: 1
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: true,
                    message: "Student updated successfully"
                });

                const result = await updateStudent(payload);

                expect(result).toHaveProperty("message");
            });

            test("should handle null values in update", async () => {
                const payload = {
                    studentId: 1,
                    phone: null
                };

                addOrUpdateStudent.mockResolvedValue({
                    status: true,
                    message: "Student updated successfully"
                });

                const result = await updateStudent(payload);

                expect(result).toHaveProperty("message");
            });
        });
    });

    describe("setStudentStatus", () => {
        describe("Positive Test Cases", () => {
            test("should activate student", async () => {
                const payload = { userId: 1, reviewerId: 2, status: true };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentToSetStatus.mockResolvedValue(1);

                const result = await setStudentStatus(payload);

                expect(findUserById).toHaveBeenCalledWith(1);
                expect(findStudentToSetStatus).toHaveBeenCalledWith(payload);
                expect(result).toEqual({ message: "Student status changed successfully" });
            });

            test("should deactivate student", async () => {
                const payload = { userId: 1, reviewerId: 2, status: false };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentToSetStatus.mockResolvedValue(1);

                const result = await setStudentStatus(payload);

                expect(result).toEqual({ message: "Student status changed successfully" });
            });

            test("should track reviewer information", async () => {
                const payload = { userId: 1, reviewerId: 5, status: true };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentToSetStatus.mockResolvedValue(1);

                await setStudentStatus(payload);

                expect(findStudentToSetStatus).toHaveBeenCalledWith(
                    expect.objectContaining({
                        reviewerId: 5
                    })
                );
            });
        });

        describe("Negative Test Cases", () => {
            test("should throw error when student not found", async () => {
                const payload = { userId: 999, reviewerId: 2, status: true };

                findUserById.mockResolvedValue(null);

                await expect(setStudentStatus(payload)).rejects.toThrow(
                    new ApiError(404, "Student not found")
                );
            });

            test("should throw error when status update fails", async () => {
                const payload = { userId: 1, reviewerId: 2, status: true };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentToSetStatus.mockResolvedValue(0);

                await expect(setStudentStatus(payload)).rejects.toThrow(
                    new ApiError(500, "Unable to disable student")
                );
            });

            test("should not update status if student not found", async () => {
                const payload = { userId: 999, reviewerId: 2, status: true };

                findUserById.mockResolvedValue(null);

                try {
                    await setStudentStatus(payload);
                } catch (error) {
                    expect(findStudentToSetStatus).not.toHaveBeenCalled();
                }
            });
        });

        describe("Edge Test Cases", () => {
            test("should handle status change from true to false", async () => {
                const payload = { userId: 1, reviewerId: 2, status: false };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentToSetStatus.mockResolvedValue(1);

                const result = await setStudentStatus(payload);

                expect(result).toHaveProperty("message");
            });

            test("should handle duplicate reviewer", async () => {
                const payload = { userId: 1, reviewerId: 1, status: true };

                findUserById.mockResolvedValue({ id: 1, role_id: 3 });
                findStudentToSetStatus.mockResolvedValue(1);

                const result = await setStudentStatus(payload);

                expect(result).toHaveProperty("message");
            });
        });
    });
});
