export const UserRole = {
  SuperAdmin: 0,
  Admin: 5,
  OrdinaryUser: 10,
  Guest: 15
};


export default function(roleRequired) {
  return (req, res, next) => {
    if ((UserRole[req.user?.role] ?? Infinity) <= roleRequired) {
      return next();
    } else {
      return res.sendStatus(403);
    }
  };
}
