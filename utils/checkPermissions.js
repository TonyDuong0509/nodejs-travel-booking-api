const CustomAPIError = require("./../errors");

const checkPermissions = (requestUer, resourceUserId) => {
  if (requestUer.role === "Admin") return;
  if (requestUer.userId === resourceUserId.toString()) return;
  throw new CustomAPIError.Unauthorized("Not authorized to access this route");
};

module.exports = checkPermissions;
