import { SidebarUser } from "types/types";
import { Avatar, Typography, IconButton } from "@material-ui/core";
import { timeDisplayer } from "@guybendavid/utils";
import SearchIcon from "@material-ui/icons/Search";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import "./ChatHeader.scss";

type Props = {
  selectedUser: SidebarUser;
}

const ChatHeader = ({ selectedUser }: Props) => {
  return (
    <div className="chat-header">
      <div className="left-side">
        <Avatar alt="avatar" src={selectedUser.image} />
        <div className="text-wrapper">
          <Typography className="fullname" component="span">{`${selectedUser.firstName} ${selectedUser.lastName}`}</Typography>
          <Typography component="small">{timeDisplayer(selectedUser.latestMessage?.createdAt)}</Typography>
        </div>
      </div>
      <div>
        {[SearchIcon, MoreVertIcon].map((Icon, index) => (
          <IconButton key={index}>
            <Icon />
          </IconButton>
        ))}
      </div>
    </div>
  );
};

export default ChatHeader;