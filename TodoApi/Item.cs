using System;

namespace TodoApi;

public partial class Item
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public bool? IsComplete { get; set; }

    // הוספת מזהה משתמש
    public int UserId { get; set; }
}
