<%@ WebHandler Language="C#" Class="VoteSubmit" %>
using System;
using System.Web;

public class VoteSubmit : IHttpHandler {
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/xml";
        context.Response.Write("<Result value=\"true\" message=\"Success!\"></Result>");
    }
    public bool IsReusable {
        get { return false; }
    }
}