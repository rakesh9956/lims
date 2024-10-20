import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionLocationsService {

  constructor() { }
  private user = new BehaviorSubject<string>('');
  castUser = this.user.asObservable();
  private Locationguid = new BehaviorSubject<string>('');
  Changelocation = this.Locationguid.asObservable();
  private Locations = new BehaviorSubject<string>('');
  UserPermissionLocations = this.Locations.asObservable();
  private reloadSubject = new Subject<void>();

  get reloadEvent() {
    return this.reloadSubject.asObservable();
  }

  reload() {
    this.reloadSubject.next();
  }
  editUser(newUser: any) {
    this.user.next(newUser);
  }
  ChangeLocation(location: any) {
    this.Locationguid.next(location);
  }
  Userdeortments(deportments: any) {
    this.Locations.next(deportments)
  }
}
