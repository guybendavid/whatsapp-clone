import { useRef, useCallback, Fragment } from "react";
import { User } from "types/types";
import { List, ListItem, Avatar, Typography, Divider } from "@material-ui/core";
import { getAuthData } from "services/auth";
import { getUsersSqlClauses } from "services/graphql";
import { classNamesGenerator, timeDisplayer } from "@guybendavid/utils";
import "./UsersList.scss";

interface Props {
  users?: User[];
  searchValue: string;
  isMoreUsersToFetch: boolean;
  fetchMoreUsers: (object: { variables: { loggedInUserId: string, offset: string, limit: string; }; }) => void;
  setSelectedUser: (user: User) => void;
}

const UsersList = ({ users = [], searchValue, isMoreUsersToFetch, fetchMoreUsers, setSelectedUser }: Props) => {
  const { loggedInUser } = getAuthData();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastUserRef = useCallback(node => {
    if (users.length > 0) {
      observer.current?.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && isMoreUsersToFetch && loggedInUser.id) {
          fetchMoreUsers({
            variables: {
              loggedInUserId: loggedInUser.id,
              offset: `${users.length}`,
              limit: `${getUsersSqlClauses.limit}`
            }
          });
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    }
    // eslint-disable-next-line
  }, [users, isMoreUsersToFetch]);

  return (
    <List className="users-list">
      {users.filter(user => `${user.firstName} ${user.lastName}`.toUpperCase().includes(searchValue.toUpperCase()))
        .map((user, index) => (
          <Fragment key={index}>
            <ListItem button className="list-item" onClick={() => setSelectedUser({ ...user })}
              ref={index === users.length - 1 ? lastUserRef : null}>
              <Avatar alt="avatar" src={user.image} />
              <div className="text-wrapper">
                {index > 0 && <Divider className={classNamesGenerator(user.latestMessage?.createdAt && "is-chatted")} />}
                <div className="first-row">
                  <Typography component="span" className="fullname">{`${user.firstName} ${user.lastName}`}</Typography>
                  <Typography component="small">{timeDisplayer(user.latestMessage?.createdAt)}</Typography>
                </div>
                <div className="second-row">
                  <Typography className="last-message" component="span">{user.latestMessage?.content}</Typography>
                </div>
              </div>
            </ListItem>
          </Fragment>
        ))}
    </List>
  );
};

export default UsersList;