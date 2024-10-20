import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';


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
  responseMessage: BehaviorSubject<IResponseMessage>;
  private JobDefaultsData: any;

  private subject = new Subject<any>();

  sendMessage(message: string) {
    this.subject.next({ text: message });
  }
  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  getJobDefaultsData() {
    return this.JobDefaultsData;
  }

  setJobDefaultsData(data: any) {
    this.JobDefaultsData = data;
  }



  constructor(
    private router: Router,
    private title: Title,
    private http: HttpClient
  ) {
    this.spinner = new BehaviorSubject<boolean>(false);
    this.responseMessage = new BehaviorSubject<IResponseMessage>({ status: '', message: '' });
  }

  /**
   * A function to start to load the spinner
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

  /**
   * Navigate to another route with corresponding arguments
   * @param url - Target url which is absolute url
   * @param params - optional params for target url
   */
  navigate(url: string, params = {}): void {
    this.router.navigate([url], {
      queryParams: params
    });
  }

  /**
   * empty argument will scroll to top smoothly
   *
   * i will try to focus the element if it has any error and that is input field
   */
  scrollTo(el?: Element): void {
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // try to foucs the element if that is input element
      if (el instanceof HTMLInputElement) {
        (el as HTMLInputElement).focus();
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * scrollToError - i will scroll to the error field in the page
   * used in form pages where i will find the errored element and i will focus there
   */
  scrollToError(errorClass?: string): void {
    setTimeout(() => {
      const firstElementWithError: any = document.querySelector(errorClass || '.ng-invalid[formControlName]');
      this.scrollTo(firstElementWithError);
    }, 100);
  }

  /**
   * Set Title Dynamically
   * @param title Route Title
   */
  setTitle(title: string): void {
    this.title.setTitle(title);
  }

  /**
   * Set Message Dynamically
   * @param res Message
   */
  public set setResponseMessage(Res: IResponseMessage) {
    // console.log('while setting', Res);
    this.responseMessage.next(Res);
  }

  /**
   *
   * @returns To Get Response Message
   */
  public get getResponseMessage(): Observable<IResponseMessage> {
    return this.responseMessage;
  }

}
