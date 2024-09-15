const Roles = {
	OPTIONAL: -1,
	USER: 0,
	ADMIN: 10,
	TEACHER: 1,
}

const RolesIntegerMap = {
	0: Roles.LEARNER,
	1: Roles.TEACHER,
	3: Roles.MARKETER,
	4: Roles.OPERATION,
	5: Roles.JUNIOR_CRM,
	6: Roles.SENIOR_CRM,
	10: Roles.ADMIN,
}

module.exports = {
	Roles,
	RolesIntegerMap,
}
