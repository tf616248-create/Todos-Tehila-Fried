 namespace TodoApi
{
    public class User
    {
        public int Id { get; set; }             // מזהה ייחודי
        public string Username { get; set; } = string.Empty;  // שם משתמש
        public string Password { get; set; } = string.Empty;  // סיסמה (בפשטות, נלמד בהמשך להצפין)
    }
}
