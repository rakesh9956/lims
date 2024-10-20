
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface IResponseMessage {
  status: string;
  message: string;
  time?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  spinner: BehaviorSubject<boolean>;
  loader: BehaviorSubject<boolean>;
  responseMessage: BehaviorSubject<IResponseMessage>;


  constructor(
    private router: Router,
  ) { 
    this.loader = new BehaviorSubject<boolean>(false);
    this.spinner = new BehaviorSubject<boolean>(false);
    this.responseMessage = new BehaviorSubject<IResponseMessage>({ status: '', message: '' });
  }
  navigate(url: string, params = {}): void {
    this.router.navigate([url], {
      queryParams: params
    });
  }
  /**
   * A function to stop to load the Spinner
   */
  startSpinner(): void {
    this.spinner.next(true);
  }
   /**
   * A function to stop to load the Spinner
   */
    stopSpinner(): void {
      this.spinner.next(false);
    }
}
