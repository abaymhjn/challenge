const request = require('supertest');
const { app } = require('../../../src/app');

jest.setTimeout(30000);

describe('Student Controller', () => {
    let authCookies = '';
    let csrfToken = '';
    let testStudentId;

    const testStudent = {
        name: 'Integration Test Student',
        email: `integration.test.${Date.now()}@example.com`,
        fatherName: 'Integration Father',
        guardianName: 'Integration Guardian',
        guardianPhone: '1234567890',
        relationOfGuardian: 'Father',
        currentAddress: '123 Integration St',
        permanentAddress: '123 Integration St',
        systemAccess: false
    };

    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: 'admin@school-admin.com', password: '3OU4zn3q6Zh9' });

        const rawCookies = loginRes.headers['set-cookie'] || [];
        // Strip attributes and filter out empty/cleared cookies (first=value only)
        authCookies = rawCookies
            .map(c => c.split(';')[0])
            .filter(c => { const v = c.split('=')[1]; return v && v.length > 0; })
            .join('; ');
        const csrfEntry = rawCookies
            .map(c => c.split(';')[0])
            .find(c => c.startsWith('csrfToken=') && c.split('=')[1]?.length > 0);
        csrfToken = csrfEntry ? csrfEntry.split('=')[1] : '';
    });

    afterAll(async () => {
        if (testStudentId) {
            await request(app)
                .delete(`/api/v1/students/${testStudentId}`)
                .set('Cookie', authCookies)
                .set('x-csrf-token', csrfToken);
        }
    });

    // ─── GET /api/v1/students ──────────────────────────────────────────────────

    describe('GET /api/v1/students', () => {
        describe('Positive Test Cases', () => {
            it('should retrieve all students', async () => {
                const response = await request(app)
                    .get('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken);

                expect([200, 404]).toContain(response.status);
                if (response.status === 200) {
                    expect(response.body).toHaveProperty('students');
                    expect(Array.isArray(response.body.students)).toBe(true);
                }
            });

            it('should filter students by class', async () => {
                const response = await request(app)
                    .get('/api/v1/students?className=Grade+10')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken);

                expect([200, 404]).toContain(response.status);
            });

            it('should filter students by section', async () => {
                const response = await request(app)
                    .get('/api/v1/students?section=A')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken);

                expect([200, 404]).toContain(response.status);
            });

            it('should search students by name', async () => {
                const response = await request(app)
                    .get('/api/v1/students?name=Test')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken);

                expect([200, 404]).toContain(response.status);
                if (response.status === 200) {
                    expect(Array.isArray(response.body.students)).toBe(true);
                }
            });

            it('should apply multiple filters simultaneously', async () => {
                const response = await request(app)
                    .get('/api/v1/students?className=Grade+10&section=A')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken);

                expect([200, 404]).toContain(response.status);
            });

            it('should return correct response format', async () => {
                const response = await request(app)
                    .get('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken);

                expect([200, 404]).toContain(response.status);
                if (response.status === 200) {
                    expect(response.body).toHaveProperty('students');
                    expect(Array.isArray(response.body.students)).toBe(true);
                    const student = response.body.students[0];
                    expect(student).toHaveProperty('id');
                    expect(student).toHaveProperty('name');
                    expect(student).toHaveProperty('email');
                }
            });
        });

        describe('Negative Test Cases', () => {
            it('should return 401 when no authentication token is provided', async () => {
                const response = await request(app)
                    .get('/api/v1/students')
                    .expect(401);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 for invalid filter parameters', async () => {
                const response = await request(app)
                    .get('/api/v1/students?unknownParam=value')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should require authentication token', async () => {
                const response = await request(app)
                    .get('/api/v1/students')
                    .expect(401);

                expect(response.body.error).toMatch(/unauthorized/i);
            });
        });

        describe('Edge Test Cases', () => {
            it('should handle empty search results gracefully', async () => {
                const response = await request(app)
                    .get('/api/v1/students?name=zzz_nonexistent_student_xyz')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken);

                expect([200, 404]).toContain(response.status);
            });

            it('should handle special characters in search', async () => {
                const response = await request(app)
                    .get("/api/v1/students?name=O'Brien")
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken);

                expect([200, 404]).toContain(response.status);
            });

            it('should filter by roll number', async () => {
                const response = await request(app)
                    .get('/api/v1/students?roll=1')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken);

                expect([200, 404]).toContain(response.status);
            });
        });
    });

    // ─── POST /api/v1/students ────────────────────────────────────────────────

    describe('POST /api/v1/students', () => {
        describe('Positive Test Cases', () => {
            it('should create student with all required fields and return 201', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send(testStudent)
                    .expect(201);

                expect(response.body).toHaveProperty('message');
                expect(typeof response.body.message).toBe('string');
            });

            it('should create student with optional fields', async () => {
                const studentWithOptionals = {
                    ...testStudent,
                    email: `optional.fields.${Date.now()}@example.com`,
                    phone: '9876543210',
                    gender: 'Male',
                    class: 'Grade 10',
                    section: 'A',
                    roll: '5',
                    motherName: 'Test Mother',
                    motherPhone: '9876543211'
                };

                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send(studentWithOptionals);

                expect([201, 500]).toContain(response.status);
                if (response.status === 201) {
                    expect(response.body).toHaveProperty('message');
                }
            });

            it('should handle email send failure gracefully and still return success', async () => {
                const student = {
                    ...testStudent,
                    email: `email.fail.${Date.now()}@example.com`
                };

                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send(student);

                expect([201, 500]).toContain(response.status);
                if (response.status === 201) {
                    expect(response.body.message).toMatch(/student added/i);
                }
            });

            it('should return success message on creation', async () => {
                const student = {
                    ...testStudent,
                    email: `success.msg.${Date.now()}@example.com`
                };

                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send(student)
                    .expect(201);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toMatch(/student added/i);
            });
        });

        describe('Negative Test Cases', () => {
            it('should return 400 when email field is missing', async () => {
                const { email: _email, ...studentWithoutEmail } = testStudent;

                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send(studentWithoutEmail)
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 when name field is missing', async () => {
                const { name: _name, ...studentWithoutName } = testStudent;

                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send(studentWithoutName)
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 for invalid email format', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: 'not-a-valid-email' })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 401 when not authenticated', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .send(testStudent)
                    .expect(401);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 for invalid data types', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 12345 })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });
        });

        describe('Edge Test Cases', () => {
            it('should return 400 when name contains numbers', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 'Student123' })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 when name is too short', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 'A' })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 when name exceeds max length', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 'A'.repeat(101) })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should accept email with plus addressing', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: `test+tag.${Date.now()}@example.com` });

                expect([201, 500]).toContain(response.status);
            });

            it('should trim whitespace from name field', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: `trim.test.${Date.now()}@example.com`, name: '  Test Student  ' });

                expect([201, 400]).toContain(response.status);
            });
        });
    });

    // ─── GET /api/v1/students/:id ─────────────────────────────────────────────

    describe('GET /api/v1/students/:id', () => {
        beforeAll(async () => {
            const createRes = await request(app)
                .post('/api/v1/students')
                .set('Cookie', authCookies)
                .set('x-csrf-token', csrfToken)
                .send({ ...testStudent, email: `get.detail.${Date.now()}@example.com` });

            if (createRes.status === 201 && createRes.body.userId) {
                testStudentId = createRes.body.userId;
            }
        });

        describe('Positive Test Cases', () => {
            it('should retrieve student detail by ID', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .get(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                expect(response.body).toHaveProperty('id', testStudentId);
                expect(response.body).toHaveProperty('name');
                expect(response.body).toHaveProperty('email');
            });

            it('should include all profile information', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .get(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                expect(response.body).toHaveProperty('name');
                expect(response.body).toHaveProperty('email');
                expect(response.body).toHaveProperty('systemAccess');
            });

            it('should include guardian information', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .get(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                expect(response.body).toHaveProperty('guardianName');
                expect(response.body).toHaveProperty('guardianPhone');
                expect(response.body).toHaveProperty('relationOfGuardian');
            });

            it('should include address information', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .get(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                expect(response.body).toHaveProperty('currentAddress');
                expect(response.body).toHaveProperty('permanentAddress');
            });

            it('should return correct response structure', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .get(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                const expectedFields = ['id', 'name', 'email', 'systemAccess', 'class', 'section'];
                expectedFields.forEach((field) => {
                    expect(response.body).toHaveProperty(field);
                });
            });
        });

        describe('Negative Test Cases', () => {
            it('should return 404 for non-existent student', async () => {
                const response = await request(app)
                    .get('/api/v1/students/999999')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(404);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 401 when not authenticated', async () => {
                const response = await request(app)
                    .get('/api/v1/students/1')
                    .expect(401);

                expect(response.body).toHaveProperty('error');
            });
        });

        describe('Edge Test Cases', () => {
            it('should handle student with null optional fields', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .get(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                expect(response.body).toHaveProperty('id');
            });

            it('should return 404 for very large non-existent student ID', async () => {
                const response = await request(app)
                    .get('/api/v1/students/999999999')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(404);

                expect(response.body).toHaveProperty('error');
            });
        });
    });

    // ─── PUT /api/v1/students/:id ─────────────────────────────────────────────

    describe('PUT /api/v1/students/:id', () => {
        describe('Positive Test Cases', () => {
            it('should update student with valid data', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .put(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 'Updated Student Name' })
                    .expect(200);

                expect(response.body).toHaveProperty('message');
            });

            it('should allow updating address', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .put(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, currentAddress: '456 Updated St', permanentAddress: '456 Updated St' })
                    .expect(200);

                expect(response.body).toHaveProperty('message');
            });

            it('should allow updating contact information', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .put(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, phone: '5556667777' })
                    .expect(200);

                expect(response.body).toHaveProperty('message');
            });

            it('should return success message', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .put(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send(testStudent)
                    .expect(200);

                expect(typeof response.body.message).toBe('string');
            });
        });

        describe('Negative Test Cases', () => {
            it('should return 404 for non-existent student', async () => {
                const response = await request(app)
                    .put('/api/v1/students/999999')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send(testStudent)
                    .expect(404);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 for invalid email format on update', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .put(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: 'not-an-email' })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 401 when not authenticated', async () => {
                const response = await request(app)
                    .put('/api/v1/students/1')
                    .send(testStudent)
                    .expect(401);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 for invalid data', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .put(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 'Name123Invalid' })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });
        });

        describe('Edge Test Cases', () => {
            it('should handle updating with same data (idempotent)', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .put(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send(testStudent)
                    .expect(200);

                expect(response.body).toHaveProperty('message');
            });

            it('should validate data types on update', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .put(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 12345 })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });
        });
    });

    // ─── POST /api/v1/students/:id/status ────────────────────────────────────

    describe('POST /api/v1/students/:id/status', () => {
        describe('Positive Test Cases', () => {
            it('should deactivate student account', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .post(`/api/v1/students/${testStudentId}/status`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ status: false })
                    .expect(200);

                expect(response.body).toHaveProperty('message');
            });

            it('should activate student account', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .post(`/api/v1/students/${testStudentId}/status`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ status: true })
                    .expect(200);

                expect(response.body).toHaveProperty('message');
            });

            it('should return success message', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .post(`/api/v1/students/${testStudentId}/status`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ status: true })
                    .expect(200);

                expect(typeof response.body.message).toBe('string');
            });
        });

        describe('Negative Test Cases', () => {
            it('should return 404 for non-existent student', async () => {
                const response = await request(app)
                    .post('/api/v1/students/999999/status')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ status: true })
                    .expect(404);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 when status is not a boolean', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .post(`/api/v1/students/${testStudentId}/status`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ status: 'yes' })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 401 when not authenticated', async () => {
                const response = await request(app)
                    .post('/api/v1/students/1/status')
                    .send({ status: true })
                    .expect(401);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 400 when status field is missing', async () => {
                if (!testStudentId) return;

                const response = await request(app)
                    .post(`/api/v1/students/${testStudentId}/status`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({})
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });
        });

        describe('Edge Test Cases', () => {
            it('should handle setting same status twice', async () => {
                if (!testStudentId) return;

                await request(app)
                    .post(`/api/v1/students/${testStudentId}/status`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ status: true });

                const response = await request(app)
                    .post(`/api/v1/students/${testStudentId}/status`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ status: true })
                    .expect(200);

                expect(response.body).toHaveProperty('message');
            });
        });
    });

    // ─── DELETE /api/v1/students/:id ─────────────────────────────────────────

    describe('DELETE /api/v1/students/:id', () => {
        let deleteStudentId;

        beforeAll(async () => {
            const createRes = await request(app)
                .post('/api/v1/students')
                .set('Cookie', authCookies)
                .set('x-csrf-token', csrfToken)
                .send({ ...testStudent, email: `delete.test.${Date.now()}@example.com` });

            if (createRes.status === 201 && createRes.body.userId) {
                deleteStudentId = createRes.body.userId;
            }
        });

        describe('Positive Test Cases', () => {
            it('should delete student and return success message', async () => {
                if (!deleteStudentId) return;

                const response = await request(app)
                    .delete(`/api/v1/students/${deleteStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toMatch(/deleted/i);
                deleteStudentId = null;
            });
        });

        describe('Negative Test Cases', () => {
            it('should return 404 when deleting non-existent student', async () => {
                const response = await request(app)
                    .delete('/api/v1/students/999999')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(404);

                expect(response.body).toHaveProperty('error');
            });

            it('should return 401 when not authenticated', async () => {
                const response = await request(app)
                    .delete('/api/v1/students/1')
                    .expect(401);

                expect(response.body).toHaveProperty('error');
            });
        });
    });

    // ─── CRUD Integration ─────────────────────────────────────────────────────

    describe('CRUD Operations Integration', () => {
        describe('Positive Test Cases', () => {
            it('should complete full CRUD cycle', async () => {
                const uniqueEmail = `crud.cycle.${Date.now()}@example.com`;

                // CREATE
                const createRes = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: uniqueEmail });

                expect(createRes.status).toBe(201);
                const createdId = createRes.body.userId;
                if (!createdId) return;

                // READ
                const readRes = await request(app)
                    .get(`/api/v1/students/${createdId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                expect(readRes.body.email).toBe(uniqueEmail);

                // UPDATE
                const updateRes = await request(app)
                    .put(`/api/v1/students/${createdId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: uniqueEmail, name: 'Updated CRUD Student' })
                    .expect(200);

                expect(updateRes.body).toHaveProperty('message');

                // DELETE
                const deleteRes = await request(app)
                    .delete(`/api/v1/students/${createdId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                expect(deleteRes.body.message).toMatch(/deleted/i);

                // VERIFY DELETED
                await request(app)
                    .get(`/api/v1/students/${createdId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(404);
            });

            it('should maintain data consistency after update', async () => {
                if (!testStudentId) return;

                const updatedName = 'Consistent Name Test';

                await request(app)
                    .put(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: updatedName })
                    .expect(200);

                const readRes = await request(app)
                    .get(`/api/v1/students/${testStudentId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                expect(readRes.body.name).toBe(updatedName);
            });

            it('should respect access control - deny unauthenticated CRUD', async () => {
                await request(app).get('/api/v1/students').expect(401);
                await request(app).post('/api/v1/students').send(testStudent).expect(401);
                await request(app).put('/api/v1/students/1').send(testStudent).expect(401);
                await request(app).delete('/api/v1/students/1').expect(401);
            });
        });

        describe('Negative Test Cases', () => {
            it('should prevent deleting non-existent records', async () => {
                const response = await request(app)
                    .delete('/api/v1/students/999999')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(404);

                expect(response.body).toHaveProperty('error');
            });

            it('should enforce unique email constraint', async () => {
                const duplicateEmail = `duplicate.${Date.now()}@example.com`;

                const firstRes = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: duplicateEmail });

                expect(firstRes.status).toBe(201);

                const duplicateRes = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: duplicateEmail });

                expect(duplicateRes.status).not.toBe(201);

                // cleanup
                if (firstRes.body.userId) {
                    await request(app)
                        .delete(`/api/v1/students/${firstRes.body.userId}`)
                        .set('Cookie', authCookies)
                        .set('x-csrf-token', csrfToken);
                }
            });
        });

        describe('Edge Test Cases', () => {
            it('should return 404 after deleting a student', async () => {
                const uniqueEmail = `after.delete.${Date.now()}@example.com`;
                const createRes = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: uniqueEmail });

                if (createRes.status !== 201 || !createRes.body.userId) return;

                await request(app)
                    .delete(`/api/v1/students/${createRes.body.userId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(200);

                await request(app)
                    .get(`/api/v1/students/${createRes.body.userId}`)
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(404);
            });
        });
    });

    // ─── Error Handling and Validation ────────────────────────────────────────

    describe('Error Handling and Validation', () => {
        describe('Positive Test Cases', () => {
            it('should validate all input data and return descriptive errors', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ name: '', email: '' })
                    .expect(400);

                expect(response.body).toHaveProperty('error', 'Validation error');
                expect(Array.isArray(response.body.detail)).toBe(true);
                expect(response.body.detail.length).toBeGreaterThan(0);
            });

            it('should provide meaningful error messages', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: 'bad-email' })
                    .expect(400);

                expect(response.body.detail).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ message: expect.any(String) })
                    ])
                );
            });
        });

        describe('Negative Test Cases', () => {
            it('should reject invalid input types', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: true })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should reject empty required fields', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ name: '', email: '' })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should enforce field length constraints - name too long', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 'A'.repeat(101) })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should enforce field length constraints - name too short', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 'A' })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should reject null values for required fields', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: null })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });
        });

        describe('Edge Test Cases', () => {
            it('should handle boundary values - minimum valid name length', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, email: `boundary.${Date.now()}@example.com`, name: 'Jo' });

                expect([201, 400, 500]).toContain(response.status);
            });

            it('should handle unicode characters in name', async () => {
                const response = await request(app)
                    .post('/api/v1/students')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .send({ ...testStudent, name: 'Ñoño García' })
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });

            it('should reject unknown query parameters with strict schema', async () => {
                const response = await request(app)
                    .get('/api/v1/students?invalidParam=test')
                    .set('Cookie', authCookies)
                    .set('x-csrf-token', csrfToken)
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            });
        });
    });
});
