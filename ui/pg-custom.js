
$(document).ready(function() {        
        $("#pgCity").click(function(e) {
            e.stopPropagation(), $("#searched-pg-city-list").show(), $("#searched-pg-loc-list").hide(), $("#searched-pg-type-list").hide()
        }),
        $("#propLocation").click(function(e) {
            e.stopPropagation(),$("#searched-pg-loc-list").show(),  $("#searched-pg-city-list").hide(), $("#searched-pg-type-list").hide()
        }),
        $("#propCategoryType").click(function(e) {
            e.stopPropagation(), $("#searched-pg-type-list").show(), $("#searched-pg-city-list").hide(), $("#searched-pg-loc-list").hide()
        }),  
        $("#searched-pg-city-list").on("click", "a", function(e) {
            e.preventDefault();
            var t = $(this).parent();
            t.addClass("select").siblings().removeClass("select"),
                $("#pgCity").val(t.data("city"));
            $("#pgCity").attr("uid",t.data("uid"));
            $("#pgCityId").val(t.data("uid"));
            //------------------------------
            getLocations(t.data("uid"));
            $("#searched-pg-city-list").hide();
            $("#pgCity").trigger("change");
        }),
        $("#searched-pg-loc-list").on("click", "a", function(e) {
            e.preventDefault();
            var t = $(this).parent();
            t.addClass("select").siblings().removeClass("select"),
            $("#propLocation").val(t.data("city"));
            $("#propLocation").attr("uid",t.data("uid"));
            $("#propLocationId").val(t.data("uid"));
            $("#searched-pg-loc-list").hide();
        }),
        $("#searched-pg-type-list").on("click", "a", function(e) {
            e.preventDefault();
            var t = $(this).parent();
            t.addClass("select").siblings().removeClass("select"),
            $("#propCategoryType").val(t.data("city"));
            $("#propCategoryType").attr("uid",t.data("uid"));
            $("#propCategoryTypeId").val(t.data("uid"));
            $("#searched-pg-type-list").hide();
        }),

        $(document).click(function(e) {
            if ($("#searched-pg-city-list").hide(), $("#searched-pg-loc-list").hide(), $("#searched-pg-type-list").hide(), $("#oneline-list").show(),
            0 == $(e.target).closest("#guestselect").length) {
                var t = $("#roomCount").html() + " Room(s) & " + $("#guestCount").html() + " Guest(s)";
                $("#wudstayGuests").val(t), $("#guestselect").hide()
            }
        })
        
        $("#searchButton").click(function(e) {
        e.preventDefault();
        searchHotel();
    }), $("#searchPgButton").click(function(e) {
        e.preventDefault();
        searchPgHotel();
    })
});