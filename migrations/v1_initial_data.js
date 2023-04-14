async function createRoleIfNotExist(type, name, description) {
  let role = await strapi.query('role', 'users-permissions').findOne({type});
  if (!role) {
    role = await strapi.query('role', 'users-permissions').create({name, description, type});
  }
  return role;
}

async function updateRolePermissions(role, controller, action, enabled) {
  await strapi.query('permission', 'users-permissions')
    .update({role: role.id, controller, action}, {enabled});
}

module.exports = async () => {
  let staffRole = await createRoleIfNotExist(
    'staff', 'Staff', 'Users that can review the all the articles');
  // let adminRole = await createRoleIfNotExist(
  //   'administrator', 'Administrator', 'Administration control in the application');

  const controllers = [{
    name: 'episode',
    actions: ['count', 'find', 'findone'],
    enabled: true
  }];

  for (let controller of controllers) {
    for (let action of controller.actions) {
      await updateRolePermissions(staffRole, controller.name, action, controller.enabled);
    }
  }
};
