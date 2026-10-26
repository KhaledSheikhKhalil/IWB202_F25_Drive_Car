var carBookings = [];
var activeCarIndex = 0;

$(document).ready(function () {

    if (localStorage.getItem("theme") === "dark") {
        $("body").addClass("dark-mode");
    }

    $("#themeToggle").click(function () {
        $("body").toggleClass("dark-mode");
        if ($("body").hasClass("dark-mode")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });

    $(".details-check").change(function () {
        var carRow = $(this).closest(".car");
        var detailsRow = carRow.next(".details-row");
        var detailsBox = detailsRow.find(".details");
        var labelSpan = $(this).siblings("span");

        if ($(this).is(":checked")) {
            detailsRow.show();
            detailsBox.stop(true, true).slideDown(220);
            labelSpan.text("إخفاء التفاصيل");
        } else {
            detailsBox.stop(true, true).slideUp(200, function () {
                detailsRow.hide();
            });
            labelSpan.text("إظهار التفاصيل");
        }
    });

    $(".select-check").change(function () {
        var carRow = $(this).closest(".car");
        var labelBtn = $(this).closest(".table-btn");
        var labelSpan = $(this).siblings("span");

        if ($(this).is(":checked")) {
            carRow.addClass("selected");
            labelSpan.text("تم  ✓");
            labelBtn.removeClass("btn-primary").addClass("btn-success");
        } else {
            carRow.removeClass("selected");
            labelSpan.text("اختيار");
            labelBtn.removeClass("btn-success").addClass("btn-primary");
        }
        $("#count").text($(".car.selected").length);
    });

    $("#btnContinue").click(function () {
        if ($(".car.selected").length == 0) {
            showModal("error", "تنبيه", "يرجى اختيار سيارة واحدة على الأقل للمتابعة.");
            return;
        }

        carBookings = [];
        var names = [];
        $(".car.selected").each(function () {
            var name = $(this).data("name");
            names.push(name);
            carBookings.push({
                name: name,
                price: Number($(this).data("price")),
                start: "",
                end: ""
            });
        });

        $("#chosenCars").text(names.join("، "));
        
        $("#carsTabsContainer").show();
        activeCarIndex = 0;
        renderCarTabs();
        loadCarDates();
        
        openDrawer();
    });

    $("#closeDrawer").click(closeDrawer);
    $("#drawerOverlay").click(closeDrawer);
    $("#modalBtn").click(closeModal);
    $("#modalOverlay").click(closeModal);

    $("#fullName").on("input blur", checkName);
    $("#nationalId").on("input blur", checkNationalId);
    $("#mobile").on("input blur", checkMobile);
    $("#email").on("input blur", checkEmail);
    
    $("#startDate, #endDate").on("change blur", function () {
        if (carBookings.length > 0) {
            carBookings[activeCarIndex].start = $("#startDate").val();
            carBookings[activeCarIndex].end = $("#endDate").val();
        }
        checkStartDate();
        checkEndDate();
        updateDays();
    });

    $("#rentForm").submit(function (e) {
        e.preventDefault();
        validateAndSubmit();
    });
});

function renderCarTabs() {
    var html = "";
    for (var i = 0; i < carBookings.length; i++) {
        var activeClass = (i === activeCarIndex) ? "active" : "";
        html += '<button type="button" class="car-tab ' + activeClass + '" onclick="selectCarTab(' + i + ')">' + carBookings[i].name + '</button>';
    }
    $("#carTabs").html(html);
}

window.selectCarTab = function (index) {
    activeCarIndex = index;
    renderCarTabs();
    loadCarDates();
};

function loadCarDates() {
    var car = carBookings[activeCarIndex];
    $("#startDate").val(car.start);
    $("#endDate").val(car.end);
    
    $(".field").removeClass("valid invalid");
    $(".field .error").text("");
    
    if (car.start != "" || car.end != "") {
        checkStartDate();
        checkEndDate();
    }
    updateDays();
}

function openDrawer() {
    $("#drawerOverlay").fadeIn(200);
    $("#bookingDrawer").addClass("open");
}

function closeDrawer() {
    $("#drawerOverlay").fadeOut(200);
    $("#bookingDrawer").removeClass("open");
}

function showModal(type, title, content) {
    $("#modalIcon").attr("class", type == "error" ? "modal-icon error" : "modal-icon success").text(type == "error" ? "!" : "✓");
    $("#modalTitle").text(title);
    $("#modalBody").html(content);
    $("#modalOverlay").fadeIn(200);
    $("#modal").fadeIn(200);
}

function closeModal() {
    $("#modalOverlay").fadeOut(200);
    $("#modal").fadeOut(200);
}

function showError(id, message) {
    var field = $("#" + id).closest(".field");
    field.find(".error").text(message);
    field.removeClass("valid invalid");

    if (message != "") {
        field.addClass("invalid");
    } else if ($("#" + id).val() != "") {
        field.addClass("valid");
    }
    return message == "";
}

function checkName() {
    var value = $("#fullName").val().trim();
    var arabicPattern = /^[\u0621-\u064A\s]+$/;
    var message = "";

    if (value == "") {
        message = "";
    } else if (!arabicPattern.test(value)) {
        message = "اكتب الاسم بأحرف عربية فقط";
    } else if (value.indexOf(" ") == -1) {
        message = "اكتب الاسم والكنية";
    }
    return showError("fullName", message);
}

function checkNationalId() {
    var input = $("#nationalId");
    input.val(input.val().replace(/[^0-9]/g, ""));
    var value = input.val();
    var city = Number(value.substring(0, 2));
    var message = "";

    if (value == "") {
        message = "الرقم الوطني مطلوب";
    } else if (value.length >= 2 && (city < 1 || city > 14)) {
        message = "أول خانتين يجب أن تكون من 01 إلى 14";
    } else if (value.length < 11) {
        message = "أدخلت " + value.length + " من 11 رقم";
    }
    return showError("nationalId", message);
}

function getDate(value) {
    return new Date(value + "T00:00:00");
}

function checkStartDate() {
    var value = $("#startDate").val();
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var message = "";

    if (value == "") {
        message = "اختر تاريخ البداية للسيارة المحددة";
    } else if (getDate(value) < today) {
        message = "لا يمكن اختيار تاريخ قبل اليوم";
    }
    return showError("startDate", message);
}

function checkEndDate() {
    var start = $("#startDate").val();
    var end = $("#endDate").val();
    var message = "";

    if (end == "") {
        message = "اختر تاريخ النهاية للسيارة المحددة";
    } else if (start != "" && getDate(end) <= getDate(start)) {
        message = "يجب أن يكون بعد تاريخ البداية";
    } else if (start != "" && getDays(start, end) > 30) {
        message = "أعلى مدة للتأجير هي 30 يوم";
    }
    return showError("endDate", message);
}

function getDays(start, end) {
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.round((getDate(end) - getDate(start)) / oneDay);
}

function updateDays() {
    var start = $("#startDate").val();
    var end = $("#endDate").val();

    if (start == "" || end == "" || getDays(start, end) <= 0) {
        $("#daysBox").removeClass("show");
        return;
    }
    var days = getDays(start, end);
    $("#daysCount").text(days);
    $("#daysBox").addClass("show");

    if (days > 7) {
        $("#discountBadge").addClass("show");
    } else {
        $("#discountBadge").removeClass("show");
    }
}

function getOperator(value) {
    var prefix = value.substring(0, 3);
    
    if (prefix == "093" || prefix == "098" || prefix == "099") {
        return "syriatel";
    }
    if (prefix == "094" || prefix == "095" || prefix == "096") {
        return "mtn";
    }
    return "";
}

function showSimTag(operator) {
    var tag = $("#simTag");

    if (operator == "") {
        tag.attr("class", "sim-tag");
        return;
    }
    if (tag.hasClass(operator)) return;
    tag.attr("class", "sim-tag " + operator).text(operator == "mtn" ? "MTN" : "Syriatel");
    setTimeout(function () { tag.addClass("show"); }, 10);
}

function checkMobile() {
    var input = $("#mobile");
    input.val(input.val().replace(/[^0-9]/g, ""));
    var value = input.val();
    var operator = getOperator(value);
    var message = "";

    showSimTag(operator);

    if (value != "" && (value.charAt(0) != "0" || (value.length > 1 && value.charAt(1) != "9"))) {
        message = "الرقم يجب أن يبدأ بـ 09";
    } else if (value.length >= 3 && operator == "") {
        message = "البادئة غير تابعة Syriatel أو MTN";
    } else if (value != "" && value.length < 10) {
        message = "أدخلت " + value.length + " من 10 أرقام";
    }
    return showError("mobile", message);
}

function checkEmail() {
    var value = $("#email").val().trim();
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var message = "";

    if (value != "" && !emailPattern.test(value)) {
        message = "مثال: name@example.com";
    }
    return showError("email", message);
}

function validateAndSubmit() {
    var allDatesOk = true;
    var errorCarIndex = -1;

    for (var i = 0; i < carBookings.length; i++) {
        var s = carBookings[i].start;
        var e = carBookings[i].end;

        if (s == "" || e == "" || getDays(s, e) <= 0 || getDays(s, e) > 30) {
            allDatesOk = false;
            errorCarIndex = i;
            break;
        }
    }

    if (!allDatesOk) {
        selectCarTab(errorCarIndex);
        checkStartDate();
        checkEndDate();
        showModal("error", "تنبيه", "يرجى تحديد تواريخ حجز صحيحة للسيارة: <br /><strong>" + carBookings[errorCarIndex].name + "</strong>");
        return;
    }

    var nameOk = checkName();
    var idOk = checkNationalId();
    var mobileOk = checkMobile();
    var emailOk = checkEmail();

    if (!nameOk || !idOk || !mobileOk || !emailOk) {
        showModal("error", "يوجد أخطاء", "يرجى تصحيح الحقول المعلّمة باللون الأحمر.");
        return;
    }

    var finalHtml = "";
    var totalAmountBeforeDiscount = 0;
    var totalDiscount = 0;

    for (var j = 0; j < carBookings.length; j++) {
        var days = getDays(carBookings[j].start, carBookings[j].end);
        var sub = days * carBookings[j].price;
        var disc = (days > 7) ? (sub * 0.1) : 0;
        
        totalAmountBeforeDiscount += sub;
        totalDiscount += disc;

        finalHtml += "<div><span>" + carBookings[j].name + "</span><strong>" + days + " يوم (" + carBookings[j].price.toLocaleString() + " ل.س/يوم)</strong></div>";
    }

    var grandTotal = totalAmountBeforeDiscount - totalDiscount;

    var html = "<div class='summary'>" +
        finalHtml +
        "<div><span>المبلغ الإجمالي</span><strong>" + totalAmountBeforeDiscount.toLocaleString() + " ل.س</strong></div>" +
        "<div><span>مجموع الخصم 10% (إن وجد)</span><strong>" + totalDiscount.toLocaleString() + " ل.س</strong></div>" +
        "<div class='total'><span>المبلغ النهائي المطلوب</span><span>" + grandTotal.toLocaleString() + " ل.س</span></div>" +
        "</div>";

    closeDrawer();
    showModal("success", "تم الحجز بنجاح", html);
    resetPage();
}

function resetPage() {
    $("#rentForm")[0].reset();
    $(".field").removeClass("valid invalid");
    $(".field .error").text("");
    $("#simTag").attr("class", "sim-tag");
    $("#daysBox").removeClass("show");
    $("#discountBadge").removeClass("show");
    $(".car.selected").removeClass("selected");
    $(".details").hide();
    $(".details-row").hide();
    $(".details-check").prop("checked", false).siblings("span").text("إظهار التفاصيل");
    $(".select-check").prop("checked", false).siblings("span").text("اختيار");
    $(".select-check").closest(".table-btn").removeClass("btn-success").addClass("btn-primary");
    $("#count").text("0");
    carBookings = [];
}