using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Chatroom.API.Hubs
{
    public class ChatHub : Hub<ITypedHubClient>
    {
        public string GetConnectionId()
        {
            return Context.ConnectionId;
        }

        public Task JoinGroup(string groupName)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }
    }
}
