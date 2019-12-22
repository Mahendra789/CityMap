import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapModel } from './map-model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiURL: string = 'https://indian-cities-api-nocbegfhqg.now.sh';

  constructor(private httpClient: HttpClient) {}

  public getMapDetails(){
    return this.httpClient.get<MapModel[]>(`${this.apiURL}/cities`);
}

}