# Editstrap2
FREE and WORKING version of the original Editstrap

## Setup: 

**Asp / AspMvc .NET:**  
```html
    <link href="@Url.Content("~/Content/editstrap.css")" rel="stylesheet">
    <script src="@Url.Content("~/Scripts/editstrap-3.3.1.js")"></script>
```

**Pure html:**  

```html
    <link href="css/editstrap.css" rel="stylesheet">
    <script src="scripts/editstrap-3.3.1.js"></script>
```

**Other libs needed:**  
- Bootstrap4 
- Font awesome

**Sample working in-edit element:**  
```javascript
<i id="toEdit" class=""></i>
<script>
    $(function() {
        $("#toEdit").editstrap({
            type: 'text',
            validateClass:'success',
            saveOptions:'block',
            title: 'Upravit',
            editClasses:'fas fa-check',
            emptyField: 'No data',
            displaySuccess:function(editable,value,text){
                var element = editable.parent().parent().find(".result-message");
                element.html("Úspěšně synchronizováno");
                element.addClass('edit-has-succes animated bounceOutLeft'); 
                element.show().delay(1000).fadeOut();
            
            }
         
        });
    }); 
</script>
```

## Changes VS the original Editstrap:
- Fully supports Bootstrap4
- Missing glyphicons are now rendering correctly
- Version 3.3.1 -> Latest public version of the original lib is 3.2.0 -> Includes some fixes and performace 'improvements'

_Support the original author and buy useless version of this for 15$ only: https://editstrap.com/index.html_
