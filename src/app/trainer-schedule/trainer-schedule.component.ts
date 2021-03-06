import {Component, OnInit, ViewChild} from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for dateClick
import {HttpClient} from '@angular/common/http';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-trainer-schedule',
  templateUrl: './trainer-schedule.component.html',
  styleUrls: ['./trainer-schedule.component.css']
})
export class TrainerScheduleComponent implements OnInit {
  @ViewChild('calendar', {static: false}) calendarComponent: FullCalendarComponent;
  calendarPlugins = [dayGridPlugin, interactionPlugin];
  SERVER_URL_GET = 'http://localhost:4300/api/trainer/schedule';
  SERVER_URL_POST = 'http://localhost:4300/api/trainer/schedule/add';
  SERVER_URL_DELETE = 'http://localhost:4300/api/trainer/schedule/delete';
  SERVER_URL_GET_BOOKINGS = 'http://localhost:4300/api/trainer/bookings';
  private eventColor = 'green';
  private account;
  calendarEvents = [
  ];
  constructor(
    private httpClient: HttpClient
  ) {
    this.account = JSON.parse(localStorage.getItem('currentUser'));

    this.updateCal();
  }

  updateCal() {
    const httpData = {
      email: this.account.email
    };
    this.httpClient.get<any>(this.SERVER_URL_GET, {
      params: httpData
    }).subscribe(
      (res) => {
        this.calendarEvents = [];
        this.calendarEvents = this.calendarEvents.concat(
          res
        );
        this.getBookings();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ngOnInit() {
  }

  handleDateClick(arg) {
    console.log(arg);
    const newDate = {
      email: this.account.email,
      date: arg.dateStr
    };
    this.httpClient.post<any>(this.SERVER_URL_POST, newDate).subscribe(
      (res) => {
        this.updateCal();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  handleEventClick(arg) {
    console.log(arg);
    if (arg.event.backgroundColor !== this.eventColor) {
      const removeDate = {
        email: this.account.email,
        date: arg.event.start.toISOString()
      };
      this.httpClient.post<any>(this.SERVER_URL_DELETE, removeDate).subscribe(
        (res) => {
          this.updateCal();
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  getBookings() {
    this.httpClient.get<any>(this.SERVER_URL_GET_BOOKINGS, {
      params: {
        email: this.account.email
      }
    }).subscribe(
      (res) => {
        const bookedEvents = res.map(event => ({
          title: 'T: ' + event.petName,
          date: event.date,
          color: this.eventColor
        }));
        this.calendarEvents = this.calendarEvents.concat(bookedEvents);
        console.log(this.calendarEvents);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
