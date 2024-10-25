const createTokenUser = (user) => {
  return { userId: user._id, fullName: user.fullName, role: user.role };
};

module.exports = createTokenUser;
