using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Chatroom.API.Dtos
{
    public class MessagePayloadDto
    {
        public string Username { get; set; }
        public string Message { get; set; }
    }
}
