import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GscrudService {

  // private apiUrl = 'https://script.google.com/macros/s/AKfycbyVxgpZZjJ2M0DN4Wsud7biNnIVSmt2fphCPLbHxs_Oc2GHH0BJDS2TO_pDf_x3E02L/exec'; 
  // ⬆️ Replace DEPLOY_ID with your actual deployment ID
  private apiUrl = '/api'; // instead of full Apps Script URL


  constructor(private http: HttpClient) {}

  /**
   * Get data from a specific sheet (model)
   */
  getSheet(sheetName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?sheet=${sheetName}`);
  }

  /**
   * Overwrite sheet data in bulk
   * @param sheetName Name of sheet/tab
   * @param data 2D array of values [ [header1, header2, ...], [row1], [row2], ... ]
   */
  updateSheet(sheetName: string, data: any[][]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?sheet=${sheetName}`, data);
  }
}
