<%@ Page Language="C#" %>
<%@ Import Namespace="Tank.Request.CenterService" %>
<script runat="server">
protected void Page_Load(object sender, EventArgs e) {
    try {
        int uid = Convert.ToInt32(Request["uid"] ?? "1");
        string action = Request["action"] ?? "mail";
        using (CenterServiceClient client = new CenterServiceClient()) {
            if (action == "mail") {
                bool ok = client.MailNotice(uid);
                Response.Write("MailNotice: " + ok);
            } else if (action == "kick") {
                bool ok = client.KitoffUser(uid, "GM Update");
                Response.Write("KitoffUser: " + ok);
            }
        }
    } catch (Exception ex) {
        Response.Write("Error: " + ex.Message);
    }
}
</script>