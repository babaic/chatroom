using Chatroom.API.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Chatroom.API.Hubs
{
    public interface ITypedHubClient
    {
        Task BroadcastMessage(string type, MessagePayloadDto payload);
        Task UpdateVideo(string type, string videoId);
        //Task BroadcastMessage(string type, MessageToSendDto payload);
        Task SendMessageToUser(string connectionid, string message);

    }

}
