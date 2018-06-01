using System.Collections.Generic;

public static class Resources
{
    public static class Colors
    {
        public const string GREEN= "green";
        public const string BLUE = "blue";
        public const string YELLOW = "yellow";
        public const string RED = "red";
        public const string BLACK = "black";
    }

    public static class Delimiters
    {
        public const string PRINTABLE = @"[\[\].,\/#!$%\^&\*;:{}=\-_`~()<>]$";
        public static readonly List<string> NONPRINTABLE = new List<string>(){
                    "Alt","Control","Shift","Enter","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","ArrowLeft","ArrowDown","ArrowRight",
                    "ArrowUp","Insert","Delete","Home","End","PageUp","PageDown", "Escape"
            };
    }

    public static class KeyWords
    {
        public static readonly List<string> C_LANGUAGE = new List<string>() {
                "auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","int","long","register",
                "return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while"
            };
    }
}

