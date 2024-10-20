import { Component, OnInit } from '@angular/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { DashboardService } from 'src/app/core/Services/dashboard.service';
import { UserPermissionLocationsService } from 'src/app/core/Services/user-permission-locations.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  preserveWhitespaces: true
})
export class DashboardComponent implements OnInit {
  isVisible: boolean = true;
  shimmerVisible: boolean;
  Dashboard: boolean;

  /**
   * Apex chart
   */
  public customersChartOptions: any = {};
  public ordersChartOptions: any = {};
  public growthChartOptions: any = {};
  public revenueChartOptions: any = {};
  public monthlySalesChartOptions: any = {};
  public cloudStorageChartOptions: any = {};
  public RequestCountChartOptions: any = {};
  public RecivedChartOptions: any = {};
  public monthlySIChartOptions: any = {};
  public ConsumeChartOptions: any = {};
  // colors and font variables for apex chart 
  obj = {
    primary: "#6571ff",
    secondary: "#7987a1",
    success: "#05a34a",
    info: "#66d1d1",
    warning: "#fbbc06",
    danger: "#ff3366",
    light: "#e9ecef",
    dark: "#060c17",
    muted: "#7987a1",
    gridBorder: "rgba(77, 138, 240, .15)",
    bodyColor: "#000",
    cardBg: "#fff",
    fontFamily: "'Roboto', Helvetica, sans-serif"
  }

  /**
   * NgbDatepicker
   */
  currentDate: NgbDateStruct;
  selectedDate: string = "week";
  QuotaionsList: any = [];
  suppliersList: any = [];
  grnList: any = [];
  dashboardCountsData: any = [];
  newItemsList: any = [];
  newrequestsList: any = [];
  monthlyWiseRquestsList: any = [];
  expencesCountsList: any = [];
  LocationGuid: any = [];
  AllRequests: any = [];
  RequestCounts: any = [];
  RecivedCounts: any = [];
  MonthlyWiseSIrequests: any = [];
  ConsumeQuantity: any = [];
  TotalItemCount: number;
  DispatchQuantity: any=[];
  recivedtotal: any;
  consumetotal: any;
  IndentRecived: any;
  Dispatch: any;
  requesttotal: any;

  constructor(private calendar: NgbCalendar, private dashbioard: DashboardService,public authservice: AuthenticationService,
    private UserPermissionService: UserPermissionLocationsService) {
    this.UserPermissionService.reloadEvent.subscribe(() => {
      this.ngOnInit()

    });
  }

  ngOnInit(): void {
    this.Dashboard = this.authservice.LoggedInUser.STORE
    // this.Dashboard =localStorage.getItem('DefaultStore');
    this.getDashBoardDetails()
    this.currentDate = this.calendar.getToday();

    // Some RTL fixes. (feel free to remove if you are using LTR))
    if (document.querySelector('html')?.getAttribute('dir') === 'rtl') {
      this.addRtlOptions();
    }
    let SelectedLocationGuid = localStorage.getItem('SelectedLocationGuid')
    if (SelectedLocationGuid) {
      this.authservice.LoggedInUser.LOCATIONSGUID = SelectedLocationGuid
    }
  }
  getDashBoardDetails() {
    this.shimmerVisible = true;
    //this.globalService.startSpinner()
    this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID?.split(",");
    this.dashbioard.GetDashBoardData(this.selectedDate, this.LocationGuid).subscribe(data => {
      this.newItemsList = data.getNewItemsCounts
      this.QuotaionsList = data.getAllQuotationsData
      this.suppliersList = data.getAllSuppliersData
      this.grnList = data.getGRNResponsesData
      this.dashboardCountsData = data.dashboardCountData
      this.newrequestsList = data.getNewRequestCounts
      this.monthlyWiseRquestsList = data.GetMonthlyWiserequesetCounts
      this.expencesCountsList = data.GetExpencesGraphCounts
      this.AllRequests = data.GetAllSIindents;
      this.RequestCounts = data.GetSINewRequestCount;
      this.RecivedCounts = data.GetSIRecivedQuantityCount;
      this.MonthlyWiseSIrequests = data.MonthlyWiseSIrequesetCount;
      this.ConsumeQuantity = data.GetConsumeCount;
      this.DispatchQuantity=data.GetDispatchCount;
      this.revenueChartOptions = getRevenueChartOptions(this.obj, this.expencesCountsList);
        this.cloudStorageChartOptions = getCloudStorageChartOptions(this.obj, this.dashboardCountsData.TotalPOCount, this.dashboardCountsData.ApprovedPOCount, this.dashboardCountsData.TotalQuotationCount, this.dashboardCountsData.QuotationApprovedCount);
      this.monthlySalesChartOptions = getMonthlySalesChartOptions(this.obj, this.monthlyWiseRquestsList);
      this.monthlySIChartOptions = getMonthlySIChartOptions(this.obj, this.MonthlyWiseSIrequests);
      this.customersChartOptions = getCustomerseChartOptions(this.obj, this.newItemsList);
      this.ordersChartOptions = getOrdersChartOptions(this.obj, this.newrequestsList);
      this.growthChartOptions = getGrowthChartOptions(this.obj,this.DispatchQuantity);
      this.RequestCountChartOptions = getRequestCountChartOptions(this.obj, this.RequestCounts);
      this.RecivedChartOptions = getRecivedChartOptions(this.obj, this.RecivedCounts);
      this.ConsumeChartOptions = getConsumeChartOptions(this.obj, this.ConsumeQuantity);
      this.shimmerVisible = false;
      this.TotalItemCount = 0;
      for (let data of this.newItemsList) {
        const netTotal = parseFloat(data.NewItemsCount);
        this.TotalItemCount += netTotal
      }
      this.requesttotal = this.RequestCounts  .reduce((accumulator: any, obj: { SINewRequestCount: any; }) => { if (obj.SINewRequestCount) { return accumulator + obj.SINewRequestCount; }return accumulator;}, 0);
      this.recivedtotal = this.RecivedCounts.reduce((accumulator: any, obj: { SIReceiveQty: any; }) => { if (obj.SIReceiveQty) { return accumulator + obj.SIReceiveQty; }return accumulator;}, 0);
      this.consumetotal = this.ConsumeQuantity.reduce((accumulator: number, obj: { ConsumeQuantity: any; }) => { if (obj.ConsumeQuantity) {  const consumeQty = parseFloat(obj.ConsumeQuantity); 
      return accumulator + consumeQty; } return accumulator; }, 0);
      this.IndentRecived = this.newrequestsList.reduce((accumulator: any, obj: { NewRequestCount: any; }) => { if (obj.NewRequestCount) { return accumulator + obj.NewRequestCount; }return accumulator;}, 0);
      this.Dispatch = this.DispatchQuantity.reduce((accumulator: number, obj: { IssueQuantity: any; }) => { if (obj.IssueQuantity) {  const consumeQty = parseInt(obj.IssueQuantity, 10); 
        return accumulator + consumeQty; } return accumulator; }, 0);
      //this.globalService.stopSpinner()
    }, error => {
      //this.globalService.stopSpinner();
      this.shimmerVisible = false;
    });
  }

  changeData(Type: any) {
    this.selectedDate = ""
    this.selectedDate = Type
    this.getDashBoardDetails()
  }

  /**
   * Only for RTL (feel free to remove if you are using LTR)
   */
  addRtlOptions() {
    // Revenue chart
    this.revenueChartOptions.yaxis.labels.offsetX = -25;
    this.revenueChartOptions.yaxis.title.offsetX = -75;

    //  Monthly sales chart
    this.monthlySalesChartOptions.yaxis.labels.offsetX = -10;
    this.monthlySalesChartOptions.yaxis.title.offsetX = -70;

    this.monthlySIChartOptions.yaxis.labels.offsetX = -10;
    this.monthlySIChartOptions.yaxis.title.offsetX = -70;
  }
}


/**
 * Customerse chart options
 */
function getCustomerseChartOptions(obj: any, newItemsList: []) {
  const Counts = newItemsList.map((item: any) => item.NewItemsCount);
  const Dates = newItemsList.map((item: any) => {
    const [day, month, year] = item.Date.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    date.setDate(date.getDate() + 1);
    return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  });
  return {
    series: [{
      name: '',
      data: Counts
    }],
    chart: {
      type: "line",
      height: 60,
      sparkline: {
        enabled: !0
      }
    },
    colors: [obj.primary],
    xaxis: {
      type: 'datetime',
      categories: Dates
    },
    stroke: {
      width: 2,
      curve: "smooth"
    },
    markers: {
      size: 0
    },
  }
};

/**
 * Customerse chart options
 */
function getRequestCountChartOptions(obj: any, RequestCounts: []) {
  const Counts = RequestCounts.map((item: any) => item.SINewRequestCount);
  const Dates = RequestCounts.map((item: any) => {
    const [day, month, year] = item.DateTime.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    date.setDate(date.getDate() + 1);
    return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  });
  return {
    series: [{
      name: '',
      data: Counts
    }],
    chart: {
      type: "line",
      height: 60,
      sparkline: {
        enabled: !0
      }
    },
    colors: [obj.primary],
    xaxis: {
      type: 'datetime',
      categories: Dates
    },
    stroke: {
      width: 2,
      curve: "smooth"
    },
    markers: {
      size: 0
    },
  }
};

/**
 * Orders chart options
 */
function getOrdersChartOptions(obj: any, newrequestsList: []) {
  const newRequestCount = newrequestsList.map((item: any) => item.NewRequestCount);
  const newRequestDates = newrequestsList.map((request: any) => {
    const [day, month, year] = request.Date.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    date.setDate(date.getDate() + 1);
    return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  });
  return {
    series: [{
      name: '',
      data: newRequestCount
    }],
    chart: {
      type: "bar",
      height: 60,
      sparkline: {
        enabled: !0
      }
    },
    colors: [obj.primary],
    // plotOptions: {
    //   bar: {
    //     borderRadius: 2,
    //     columnWidth: "60%"
    //   }
    // },
    stroke: {
      width: 2,
      curve: "smooth"
    },
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime',
      categories: newRequestDates,
    }
  }
};

/**
 * Orders chart options
 */
function getRecivedChartOptions(obj: any, RecivedCounts: []) {
  const newRequestCount = RecivedCounts.map((item: any) => item.SIReceiveQty);
  const newRequestDates = RecivedCounts?.map((request: any) => {
    if (request.DateTime) {
      const [day, month, year] = request.DateTime.split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      date.setDate(date.getDate() + 1);
      return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
    } else {
      return null; // Handle the case when DateTime is null
    }
  });

  // Filter out null values in newRequestDates
  const filteredRequestDates = newRequestDates.filter(date => date !== null);

  return {
    series: [{
      name: '',
      data: newRequestCount
    }],
    chart: {
      type: "bar",
      height: 60,
      sparkline: {
        enabled: true // Changed !0 to true
      }
    },
    colors: [obj.primary],
    stroke: {
      width: 2,
      curve: "smooth"
    },
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime',
      categories: filteredRequestDates, // Use the filtered array
    }
  };
}


/**
 * Growth chart options
 */
function getGrowthChartOptions(obj: any,DispatchQuantity: []) {
  const newRequestCount = DispatchQuantity.map((item: any) => item.IssueQuantity);
  const newRequestDates = DispatchQuantity.map((request: any) => {
    const [day, month, year] = request.DateTime.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    date.setDate(date.getDate() + 1);
    return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  });
  return {
    series: [{
      name: '',
      data: newRequestCount
    }],
    chart: {
      type: "line",
      height: 60,
      sparkline: {
        enabled: !0
      }
    },
    colors: [obj.primary],
    xaxis: {
      type: 'datetime',
      categories: newRequestDates,
    },
    stroke: {
      width: 2,
      curve: "smooth"
    },
    markers: {
      size: 0
    },
  }

};

/**
 * Growth chart options
 */
function getConsumeChartOptions(obj: any, ConsumeQuantity: []) {
  const newRequestCount = ConsumeQuantity.map((item: any) => item.ConsumeQuantity);
  const newRequestDates = ConsumeQuantity.map((request: any) => {
    if (request.DateTime) {
    const [day, month, year] = request.DateTime.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    date.setDate(date.getDate() + 1);
    return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  }
  else{
    return null;
  }
  });
  return {
    series: [{
      name: '',
      data: newRequestCount
    }],
    chart: {
      type: "line",
      height: 60,
      sparkline: {
        enabled: !0
      }
    },
    colors: [obj.primary],
    xaxis: {
      type: 'datetime',
      categories: newRequestDates,
    },
    stroke: {
      width: 2,
      curve: "smooth"
    },
    markers: {
      size: 0
    },
  }

};



/**
 * Revenue chart options
 */
function getRevenueChartOptions(obj: any, expencesCountsList: []) {
  const expencesCountsAmount = expencesCountsList.map((item: any) => Number(item.GrnAmount).toFixed(0));
  const expencesCountsDates = expencesCountsList.map((request: any) => {
    let d = new Date(request.Date)
    let ConvertDate = moment(d).format('DD/MM/YYYY')
    const [day, month, year] = ConvertDate.split('/');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    date.setDate(date.getDate() + 1);
    return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  });
  return {
    series: [{
      name: "Expenses",
      data: expencesCountsAmount
    }],
    chart: {
      type: "line",
      height: '400',
      parentHeightOffset: 0,
      foreColor: obj.bodyColor,
      background: obj.cardBg,
      toolbar: {
        show: false
      },
    },
    colors: [obj.primary, obj.danger, obj.warning],
    grid: {
      padding: {
        bottom: -4,
      },
      borderColor: obj.gridBorder,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      type: "datetime",
      categories: expencesCountsDates,
      lines: {
        show: true
      },
      axisBorder: {
        color: obj.gridBorder,
      },
      axisTicks: {
        color: obj.gridBorder,
      },
      crosshairs: {
        stroke: {
          color: obj.secondary,
        },
      },
    },
    yaxis: {
      title: {
      //  text: 'Revenue (1000 x )',
        style: {
          size: 9,
          color: obj.muted
        }
      },
      tickAmount: 4,
      tooltip: {
        enabled: true
      },
      crosshairs: {
        stroke: {
          color: obj.secondary,
        },
      },
      labels: {
        offsetX: 0,
      },
    },
    markers: {
      size: 0,
    },
    stroke: {
      width: 2,
      curve: "straight",
    },
  }
};



/**
 * MONTHLY WISE REQUESTS chart options
 */
function getMonthlySalesChartOptions(obj: any, monthlyWiseRquestsList: []) {
  const monthlyWiseRquestsCount = monthlyWiseRquestsList.map((item: any) => item.RequestCount);
  const monthlyWiseRquestsDates = monthlyWiseRquestsList.map((item: any) => item.Month);
  return {
    series: [{
      name: 'Requests',
      data: monthlyWiseRquestsCount
    }],
    chart: {
      type: 'bar',
      height: '460',
      parentHeightOffset: 0,
      foreColor: obj.bodyColor,
      background: obj.cardBg,
      toolbar: {
        show: false
      },
    },
    colors: [obj.primary],
    fill: {
      opacity: .9
    },
    grid: {
      padding: {
        bottom: -4
      },
      borderColor: obj.gridBorder,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      type: 'datetime',
      categories: monthlyWiseRquestsDates,
      axisBorder: {
        color: obj.gridBorder,
      },
      axisTicks: {
        color: obj.gridBorder,
      },
    },
    yaxis: {
      title: {
        text: 'Number of Requests',
        style: {
          size: 9,
          color: obj.muted
        }
      },
      labels: {
        offsetX: 0,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: 'center',
      fontFamily: obj.fontFamily,
      itemMargin: {
        horizontal: 8,
        vertical: 0
      },
    },
    stroke: {
      width: 0
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px',
        fontFamily: obj.fontFamily,
      },
      offsetY: -27
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
        dataLabels: {
          position: 'top',
          orientation: 'vertical',
        }
      },
    }
  }
}
/**
 * MONTHLY WISE REQUESTS chart options
 */
function getMonthlySIChartOptions(obj: any, MonthlyWiseSIrequests: []) {
  const monthlyWiseRquestsCount = MonthlyWiseSIrequests.map((item: any) => item.SIRequestCount);
  const monthlyWiseRquestsDates = MonthlyWiseSIrequests.map((item: any) => item.Month);
  return {
    series: [{
      name: 'Requests',
      data: monthlyWiseRquestsCount
    }],
    chart: {
      type: 'bar',
      height: '460',
      parentHeightOffset: 0,
      foreColor: obj.bodyColor,
      background: obj.cardBg,
      toolbar: {
        show: false
      },
    },
    colors: [obj.primary],
    fill: {
      opacity: .9
    },
    grid: {
      padding: {
        bottom: -4
      },
      borderColor: obj.gridBorder,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      type: 'datetime',
      categories: monthlyWiseRquestsDates,
      axisBorder: {
        color: obj.gridBorder,
      },
      axisTicks: {
        color: obj.gridBorder,
      },
    },
    yaxis: {
      title: {
        text: 'Number of Requests',
        style: {
          size: 9,
          color: obj.muted
        }
      },
      labels: {
        offsetX: 0,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: 'center',
      fontFamily: obj.fontFamily,
      itemMargin: {
        horizontal: 8,
        vertical: 0
      },
    },
    stroke: {
      width: 0
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px',
        fontFamily: obj.fontFamily,
      },
      offsetY: -27
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
        dataLabels: {
          position: 'top',
          orientation: 'vertical',
        }
      },
    }
  }
}



/**
 * Cloud storage chart options
 */
function getCloudStorageChartOptions(obj: any, totalcount: number, suppliedcount: number, totalquotationcount: number, approvedcount: number) {
  const totalCountPercentage = Math.round((suppliedcount / totalcount) * 100);
  const totalCountPercentage1 = Math.round((approvedcount / totalquotationcount) * 100);

  return {
    series: [totalCountPercentage],
    series1: [totalCountPercentage1],
    chart: {
      height: 260,
      type: "radialBar"
    },
    colors: [obj.primary],
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "70%"
        },
        track: {
          show: true,
          background: obj.light,
          strokeWidth: '100%',
          opacity: 1,
          margin: 5,
        },
        dataLabels: {
          showOn: "always",
          name: {
            offsetY: -11,
            show: true,
            color: obj.muted,
            fontSize: "13px"
          },
          value: {
            color: obj.bodyColor,
            fontSize: "30px",
            show: true
          }
        }
      }
    },
    fill: {
      opacity: 1
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Approved Orders"],
    labels1: ["Approved Quotations"]

  };


}

