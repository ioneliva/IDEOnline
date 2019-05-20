using System.Collections.Generic;

public static class Resources
{
    public static class Colors
    {
        public const string GREEN = "green";
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
        public static readonly List<string> C_LANGUAGE = new List<string>()
        {
            "asm","auto","bool","break","case","catch","char","class","const","const_cast","continue","default","delete","do","double","dynamic_cast","else","enum",
            "explicit","export","extern","false","float","for","friend","goto","if","inline","int","long","mutable","namespace","new","operator","private","register",
            "protected","public","reinterpret_cast","return","short","signed","sizeof","static","struct","switch","template","this","throw","true","try,","typedef",
            "typeid","typename","union","unsigned","using","virtual","void","volatile","wchar_t","while","And","and_eq","bitand","bitor","compl","not","not_eq","or",
            "or_eq","xor","xor_eq"
        };
        public static readonly List<string> JAVA_LANGUAGE = new List<string>()
        {
            "abstract","boolean","break","byte","case","catch","char","class","const","continue","default","do","double","else","equals","extends","final","finally","float",
            "for","goto","if","implements","import","instanceof","int","interface","long","native","new","null","package","private","protected","public","return",
            "short","static","super","switch","synchronized","this","throw","throws","transient","try","void","volatile","while","assert","enum","strictfp","true","false",
            "null"
        };
        public static readonly List<string> CSHARP_LANGUAGE = new List<string>()
        {
             "abstract","add","as","alias","ascending","async","await","base","bool","break","by","byte","case","catch","char","checked","class","const","continue","decimal",
             "default","delegate","descending","do","double","dynamic","else","enum","equals","explicit","extern","false","finally","fixed","float","for","foreach","from",
             "get","global","goto","group","if","implicit","in","int","interface","internal","into","is","on","join","let","lock","long","namespace","nameof","new","null","object",
             "on","operator","orderby","out","override","params","partial","private","protected","public","readonly","ref","remove","return","sbyte","sealed","select",
             "set","short","sizeof","stackalloc","static","string","struct","switch","this","throw","true","try","typeof","uint","ulong","unchecked","unsafe","ushort",
             "using","value","var","virtual",",void","volatile","where","while","yield"
        };
    }
}


