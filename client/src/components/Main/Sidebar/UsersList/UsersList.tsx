import { useRef, useCallback, Fragment } from "react";
import { SidebarUser } from "types/types";
import { List, ListItem, Avatar, Typography, Divider } from "@material-ui/core";
import { css, cx } from "@emotion/css";
import { getOverflowStyle } from "styles/reusable-css-in-js-styles";
import { getAuthData } from "services/auth";
import { getUsersSqlClauses } from "services/graphql";
import { timeDisplayer } from "@guybendavid/utils";

type Props = {
  users?: SidebarUser[];
  searchValue: string;
  isMoreUsersToFetch: boolean;
  selectedUser?: SidebarUser;
  setSelectedUser: (user: SidebarUser) => void;
  fetchMoreUsers: (object: { variables: { loggedInUserId: string; offset: string; limit: string } }) => void;
};

export const UsersList = ({ users = [], searchValue, isMoreUsersToFetch, selectedUser, setSelectedUser, fetchMoreUsers }: Props) => {
  const { loggedInUser } = getAuthData();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastUserRef = useCallback(
    (node) => {
      if (users.length === 0) return;
      observer.current?.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && isMoreUsersToFetch) {
          fetchMoreUsers({
            variables: {
              loggedInUserId: loggedInUser.id,
              offset: `${users.length}`,
              limit: `${getUsersSqlClauses.limit}`
            }
          });
        }
      });

      if (node && observer.current) {
        observer.current.observe(node);
      }
    },

    [users, isMoreUsersToFetch]
  );

  return (
    <List className={chatStyle}>
      {users
        .filter((user) => `${user.firstName} ${user.lastName}`.toUpperCase().includes(searchValue.toUpperCase()))
        .map((user, index) => (
          <Fragment key={index}>
            <ListItem
              button={true}
              className={cx("list-item", selectedUser?.id === user.id && "is-selected")}
              onClick={() => setSelectedUser(user)}
              ref={index === users.length - 1 ? lastUserRef : null}>
              <Avatar alt="avatar" src={user.image} />
              <div className="text-wrapper">
                {index > 0 && <Divider className={cx((user.latestMessage?.createdAt && "is-chatted") || "")} />}
                <div className="first-row">
                  <Typography component="span" className="fullname">{`${user.firstName} ${user.lastName}`}</Typography>
                  <Typography component="small">{timeDisplayer(user.latestMessage?.createdAt || "")}</Typography>
                </div>
                <div className="second-row">
                  <Typography className="last-message" component="span">
                    {user.latestMessage?.content}
                  </Typography>
                </div>
              </div>
            </ListItem>
          </Fragment>
        ))}
    </List>
  );
};

const chatStyle = css`
  padding: 0 !important;
  overflow-y: auto;

  .list-item {
    display: flex;
    gap: 15px;
    padding-top: 10px;
    padding-bottom: 10px;

    &.is-selected {
      background: #f0f2f5;
    }

    .text-wrapper {
      flex: 1;

      .first-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .fullname {
          ${getOverflowStyle("162px")};
        }
      }

      .second-row {
        display: flex;

        .last-message {
          font-size: 0.9rem;
          color: var(--text-color);
          ${getOverflowStyle("260px")};
        }
      }

      hr {
        background-color: var(--divider-color);
        position: relative;
        height: 0.5px;

        &.is-chatted {
          bottom: 10px;
        }

        &:not(.is-chatted) {
          bottom: 18px;
        }
      }
    }
  }
`;
