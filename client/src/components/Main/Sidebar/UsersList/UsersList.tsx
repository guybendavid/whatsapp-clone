import React, { useContext, useRef, useCallback } from "react";
import { AppContext } from "../../../../contexts/AppContext";
import { User } from "../../../../interfaces/interfaces";
import { List, ListItem, Avatar, ListItemAvatar, Typography, Divider } from "@material-ui/core";
import { getUsersSqlClauses } from "../../../../services/graphql";
import timeDisplayer from "../../../../services/timeDisplayer";
import "./UsersList.scss";

interface Props {
  users?: User[];
  searchValue: string;
  isMoreUsersToFetch: boolean;
  fetchMoreUsers: (object: any) => void;
  setSelectedUser: (user: User) => void;
}

const UsersList: React.FC<Props> = ({ users, searchValue, isMoreUsersToFetch, fetchMoreUsers, setSelectedUser }) => {
  const { loggedInUser } = useContext(AppContext);
  const observer: any = useRef();

  const lastUserRef = useCallback(node => {
    if (users && users.length > 0) {
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
  }, [loggedInUser, users, isMoreUsersToFetch]);

  return (
    <List className="users-list">
      {users?.filter(user => `${user.firstName} ${user.lastName}`.toUpperCase().includes(searchValue.toUpperCase())).map((user, index) => (
        <React.Fragment key={index}>
          <ListItem button className="list-item" onClick={() => setSelectedUser({ ...user })}
            ref={index === users.length - 1 ? lastUserRef : null}>
            <ListItemAvatar className="avatar-wrapper">
              <Avatar className="avatar" alt="avatar" src={user?.image} />
            </ListItemAvatar>
            <div className="text-wrapper">
              {index > 0 && <Divider className={user.latestMessage?.createdAt && "is-chatted"} />}
              <div className="first-row">
                <Typography component="span" className="fullname">{`${user.firstName} ${user.lastName}`}</Typography>
                <Typography component="small">{timeDisplayer(user.latestMessage?.createdAt)}</Typography>
              </div>
              <div className="second-row">
                <Typography className="last-message" component="span">{user.latestMessage?.content}</Typography>
              </div>
            </div>
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

export default UsersList;