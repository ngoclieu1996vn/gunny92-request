<%@ WebHandler Language="C#" Class="Tank.Request.GMBridgeHandler" %>
using System;
using System.Web;
using Tank.Request.CenterService;

namespace Tank.Request
{
    public class GMBridgeHandler : IHttpHandler
    {
        public bool IsReusable { get { return true; } }

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "application/json";
            string action = (context.Request["action"] ?? "").ToLower();
            int uid = 0;
            int.TryParse(context.Request["uid"], out uid);

            if (uid <= 0)
            {
                context.Response.Write("{\"success\":false,\"message\":\"Invalid UID\"}");
                return;
            }

            try
            {
                using (CenterServiceClient client = new CenterServiceClient())
                {
                    bool res = false;
                    switch (action)
                    {
                        case "mail":
                            res = client.MailNotice(uid);
                            break;
                        case "kick":
                            res = client.KitoffUser(uid, "GM cập nhật nhân vật");
                            break;
                        case "charge":
                            res = client.ChargeMoney(uid, "GM_CHARGE");
                            break;
                        default:
                            context.Response.Write("{\"success\":false,\"message\":\"Unknown action\"}");
                            return;
                    }
                    context.Response.Write("{\"success\":true,\"result\":" + (res ? "true" : "false") + "}");
                }
            }
            catch (Exception ex)
            {
                context.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
            }
        }
    }
}
