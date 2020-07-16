using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Chatroom.API.Dtos;
using Chatroom.API.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Chatroom.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private IHubContext<ChatHub, ITypedHubClient> _hubContext;
        private IHubContext<VideoHub, ITypedHubClient> _videoContext;

        public ChatController(IHubContext<ChatHub, ITypedHubClient> hubContext, IHubContext<VideoHub, ITypedHubClient> videoContext)
        {
            _hubContext = hubContext;
            _videoContext = videoContext;
        }

        [HttpPost]
        public string Post(MessagePayloadDto payload)
        {
            string retMessage;
            try
            {

                //msg to all
                //_hubContext.Clients.All.BroadcastMessage(msg.Type, msg.Payload);

                //msg to user with conn id
                //_hubContext.Clients.Client(msg.userid).BroadcastMessage(msg.Type, msg.Payload);

                //msg to group of users
                //_hubContext.Groups.AddToGroupAsync(msg.userid, "test");


                _hubContext.Clients.Group("group1").BroadcastMessage("toall", payload);

                retMessage = "Success";
            }
            catch (Exception e)
            {
                retMessage = e.ToString();
            }
            return retMessage;
        }

        [HttpPost("UpdateVideo")]
        public string UpdateVideo(string videoid)
        {
            string retMessage;
            try
            {

                //msg to all
                //_hubContext.Clients.All.BroadcastMessage(msg.Type, msg.Payload);

                //msg to user with conn id
                //_hubContext.Clients.Client(msg.userid).BroadcastMessage(msg.Type, msg.Payload);

                //msg to group of users
                //_hubContext.Groups.AddToGroupAsync(msg.userid, "test");


                _videoContext.Clients.Group("group1").UpdateVideo("toall", videoid);

                retMessage = "Success";
            }
            catch (Exception e)
            {
                retMessage = e.ToString();
            }
            return retMessage;
        }

    }
}