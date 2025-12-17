export const getTotalUsers = "select count(id) from users";

export const getUsersWithLatestMessage = ({ offset, limit }: { offset: string; limit: string }) =>
  `select distinct on (u.id) u.id, u.first_name as "firstName",
  u.last_name as "lastName", u.image, m.content, m.created_at as "createdAt" from
  (select m.*, case when sender_id = ? then recipient_id else sender_id end as other_user_id
      from messages m where ? in (m.sender_id, m.recipient_id)) m 
      right join users u on u.id = m.other_user_id where u.id != ?
      order by u.id, m.created_at desc ${offset ? "offset ?" : ""} ${limit ? "limit ?" : ""}`;
