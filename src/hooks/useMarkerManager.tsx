import { useState, useCallback, useEffect } from 'react';
import L, { Map as LeafletMap, Marker, divIcon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import ReactDOMServer from "react-dom/server";
import { useSelector } from 'react-redux';

// Types
import type { Device, DeviceStatus } from "../types/common";

// Icons
import CameraIcon from "../assets/svg/camera.svg?react";
import RightArrowIcon from "../assets/svg/right-arrow.svg?react";

// i18n
import { useTranslation } from 'react-i18next';

// Store
import type { RootState } from "../store/store";

// Utils
import { DEVICE_STATUS_COLOR } from '../constants/color';

export const useMarkerManager = (map: LeafletMap | null) =>{
  // Data
  const [markers, setMarkers] = useState<Marker[]>([]);

  // i18n
  const { t, i18n } = useTranslation();

  // Options
  const [deviceStatusOptions, setDeviceStatusOptions] = useState<DeviceStatus[]>([]);

  // Slice
  const { deviceStatus } = useSelector((state: RootState) => state.dropdown);

  useEffect(() => {
    setDeviceStatusOptions(
      deviceStatus.map((item) => {
        const color = DEVICE_STATUS_COLOR[item.status_code];

        return {
          ...item,
          color: color ?? "#FFFFFF",
        }
      })
    );
  }, [deviceStatus])

  const clearMarkers = useCallback(() => {
    setMarkers((prevMarkers) => {
      prevMarkers.forEach((marker) => marker.remove());
      return [];
    });
  }, []);

  const clearMarkerByLocation = useCallback(async (location: { lat: number; lng: number }) => {
    setMarkers((prevMarkers) => {
      const updatedMarkers = prevMarkers.filter((marker) => {
        const markerLatLng = marker.getLatLng();
        
        const isSame = 
          markerLatLng.lat.toFixed(6) === location.lat.toFixed(6) &&
          markerLatLng.lng.toFixed(6) === location.lng.toFixed(6);

        if (isSame) {
          marker.remove();
          return false;
        }
        return true;
      });
      return updatedMarkers;
    });
  }, []);


  const createMarker = (location: LatLngExpression, color: string = "#FF0000", isLocationWithLabel: boolean = false, markerTag: string = "") => {
    if (!map) return;

    const iconSVG = `
      <svg width="30px" height="40px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.37892 10.2236L8 16L12.6211 10.2236C13.5137 9.10788 14 7.72154 14 6.29266V6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6V6.29266C2 7.72154 2.4863 9.10788 3.37892 10.2236ZM8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="${color}"/>
      </svg>
    `;

    let htmlContent = `<div style="position: relative; display: flex; align-items: center; justify-content: center;">${iconSVG}`;
    
    if (isLocationWithLabel && Array.isArray(location)) {
      const [lat, lng] = location;
      htmlContent += `
        <label style="position: absolute; bottom: -20px; left: 20px; color: white; background: black; padding: 5px 10px; border-radius: 5px; font-size: 14px; box-shadow: 0 2px 6px rgba(var(--secondary-color-rgb),0.3);">
          ${lat.toFixed(5)}, ${lng.toFixed(5)}
        </label>
      `;
    }

    htmlContent += `</div>`;

    const marker = L.marker(location, {
      icon: divIcon({
        html: htmlContent,
        className: '',
        iconSize: [30, 40],
      }),
    }).addTo(map);

    if (markerTag) {
      createToolTip(marker, location);
    }

    setMarkers([marker]);
  };

  const createMarkerWithList = (locations: {latLng: LatLngExpression, name: string}[], color: string = "#FF0000", isLocationWithLabel: boolean = false) => {
    if (!map) return;
    clearMarkers();

    const newMarkers: Marker[] = [];

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const iconSVG = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="miter"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12,2a8,8,0,0,0-8,8c0,8,8,12,8,12s8-4,8-12A8,8,0,0,0,12,2Zm0,11a3,3,0,1,1,3-3A3,3,0,0,1,12,13Z" fill="${i === 0 ? "#FF0000" : color}" opacity="1" stroke-width="0"></path><path d="M20,10c0,8-8,12-8,12S4,18,4,10a8,8,0,0,1,16,0Z"></path><circle cx="12" cy="10" r="3"></circle></g></svg>
      `;

      let htmlContent = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${iconSVG}
        </div>
      `;

      const marker = L.marker(loc.latLng, {
        icon: divIcon({
          html: htmlContent,
          className: '',
          iconSize: [30, 40],
        }),
      }).addTo(map);

      if (isLocationWithLabel && loc.latLng) {
        const latLng  = L.latLng(loc.latLng);
        createToolTip(marker, latLng);
        if (i === 0) {
          createPopup(marker, latLng);
          marker.openPopup();
        }
      }

      newMarkers.push(marker);
    };

    setMarkers(newMarkers);
  };

  const createOverallMarkerWithList = (locations: Device[]) => {
    if (!map) return;
    clearMarkers();

    const newMarkers: Marker[] = [];

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];

      const color = deviceStatusOptions.find((item) => item.status_code === loc.device_status_code)?.color ?? "#FFFFFF";
    
      let htmlContent = `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <!-- rectangle -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background-color: ${color};
            font-weight: 600;
            color: black;
          ">
            ${0}
          </div>

          <!-- triangle -->
          <div style="
            width: 0;
            height: 0;
            margin-top: -1px;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid ${color};
          "></div>
        </div>
      `;

      const marker = L.marker(loc.latLng ?? [0, 0], {
        icon: divIcon({
          html: htmlContent,
          className: '',
          iconSize: [30, 40],
          iconAnchor: [15, 36],
        }),
      });

      createOverallPopup(marker, loc);

      marker.on("click", () => {
        marker.openPopup();
      });
      marker.addTo(map);
      newMarkers.push(marker);
    };

    setMarkers(newMarkers);
  };

  const createToolTip = (marker: L.Marker<any>, latLng: LatLngExpression) => {
    const newLatLng = L.latLng(latLng);
    return marker.bindTooltip(
      `<div style="text-align: center;">
        <div>${newLatLng.lat.toFixed(5)}, ${newLatLng.lng.toFixed(5)}</div>
      </div>`,
      {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      }
    );
  }

  const createPopup = (marker: L.Marker<any>, latLng: LatLngExpression) => {
    const newLatLng = L.latLng(latLng);
    return marker.bindPopup(
      `<div style="text-align: center;">
        <div>
          ${newLatLng.lat.toFixed(5)}, ${newLatLng.lng.toFixed(5)}
        </div>
      </div>`,
      {
        closeButton: true,
        autoPan: true,
        className: "custom-map-popup",
      }
    );
  }

  const createOverallPopup = (marker: L.Marker<any>, detail: Device) => {
    const cameraLength = 0;
    const sortStatus = [];

    const cameraIconHtml = ReactDOMServer.renderToStaticMarkup(
      <CameraIcon style={{ width: "20px", height: "15px", marginTop: "5px", color:'var(--primary-color)' }} />
    );

    const rightArrowIconHtml = ReactDOMServer.renderToStaticMarkup(
      <RightArrowIcon style={{ width: "12px", height: "12px", color:'var(--primary-color)' }} />
    );

    return marker.bindPopup(
      `<div style="display: flex; padding: 2px; width: 700px; min-height: 500px; font-family: 'Noto Sans Thai', sans-serif;">
        <div style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
          <div style="display: flex; justify-content: start; align-items: start; gap: 10px">
            ${cameraIconHtml}
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: start;">
              <label style="font-weight: bold; font-size: 20px; color: var(--primary-color);">${t('text.camera-checkpoint')} : ${""}</label>
              <p style="color: var(--primary-color); margin-top: 0px;">${t('text.total-2')} ${cameraLength} จุด</p>
            </div>
          </div>
          <div style="padding: 0px 5px;">
            <div style="padding: 10px 15px; background-color: #F0F2F5; width: 100%; height: 80px">
              <label style="color: #81898E; font-size: 12px;">${t('text.area-structure')}</label>

              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
                
              </div>
            </div>
          </div>
          <div style="padding: 0px 5px;">
            <div style="padding: 10px 15px; background-color: #F0F2F5; width: 100%; min-height: 80px;">
              <label style="color: #81898E; font-size: 12px; display: block;">
                ${t('text.status')}
              </label>

              <div style="display: flex; flex-wrap: wrap; justify-content: start; align-items: center; gap: 20px; width: 100%;">
                ${
                  Object.values(
                    sortStatus.reduce((acc, item) => {
                      const key = item.status_code;

                      if (!acc[key]) {
                        acc[key] = {
                          status_code: item.status_code,
                          status_name: item.status_name,
                          count: 0,
                        };
                      }

                      acc[key].count += 1;
                      return acc;
                    }, {} as Record<number, { status_code: number; status_name: string; count: number }>)
                  )
                    .map((item) => {
                      

                      return `
                        <div style="display: flex; justify-content: start; align-items: center; gap: 10px; margin-top: 10px;">
                          <div style="width: 20px; height: 20px; background-color: ${""}; border-radius: 50%;"></div>
                          
                          <label style="color: var(--primary-color); font-size: 20px; font-weight: 500;">
                            ${""}<span> : ${0}</span>
                          </label>
                        </div>
                      `;
                    })
                    .join("")
                }
              </div>
            </div>
          </div>
          <div style="padding: 0px 5px;">
            <div style="display: flex; flex-direction: column; gap: 5px; width: 100%;">
              <label style="color: var(--primary-color); font-size: 16px;">${t('text.camera-checkpoint-list')} :</label>
              <div style="max-height: 200px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                  
                  <thead>
                    <tr style="background-color: var(--primary-color); color: white; font-size: 16px;">
                      <th style="position: sticky; top: 0; background-color: var(--primary-color); text-align: center; width: 40%; height: 60px; z-index: 1;">
                        ${t('table.header.camera-checkpoint')}
                      </th>
                      <th style="position: sticky; top: 0; background-color: var(--primary-color); text-align: center; width: 30%; z-index: 1;">
                        ${t('table.header.status')}
                      </th>
                      <th style="position: sticky; top: 0; background-color: var(--primary-color); text-align: center; width: 20%; z-index: 1;">
                        ${t('table.header.route')}
                      </th>
                      <th style="position: sticky; top: 0; background-color: var(--primary-color); text-align: center; width: 10%; z-index: 1;">
                        ${t('table.header.lane')}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    ${
                      sortStatus
                        .map((item, index) => {
                          const cameraColor =
                            deviceStatusOptions.find((opt) => opt.id === Number(item.status_id))?.color ?? "#FFFFFF";
                          return `
                            <tr key="${item.camera_name}_${index}" style="border-bottom: 1px solid rgba(var(--primary-color-rgb), 0.1); font-size: 16px; color: var(--primary-color); height: 50px;">
                              <td style="padding: 0px 10px;">${item.camera_name}</td>

                              <td style="padding: 0px 10px; vertical-align: middle;">
                                <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                                  <div style="width: 20px; height: 20px; background-color: ${cameraColor}; border-radius: 50%;"></div>
                                  <span>${item.status_name}</span>
                                </div>
                              </td>

                              <td style="padding: 0px 10px;">${item.route}</td>
                              <td style="text-align: center;">${item.lane === 1 ? t('text.exit') : t('text.in')}</td>
                            </tr>
                          `;
                        }).join("")
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>`,
      {
        offset: [0, -30],
        closeButton: true,
        maxWidth: 900,
        className: "custom-overall-popup",
      }
    )
  }

  // const createOverallPopup = (marker: L.Marker<any>, detail: Device) => {
  //   const cameraLength = detail.length;
  //   const sortStatus = detail.camera_list.sort((a, b) => a.status_id - b.status_id);

  //   const cameraIconHtml = ReactDOMServer.renderToStaticMarkup(
  //     <CameraIcon style={{ width: "20px", height: "15px", marginTop: "5px", color:'var(--primary-color)' }} />
  //   );

  //   const rightArrowIconHtml = ReactDOMServer.renderToStaticMarkup(
  //     <RightArrowIcon style={{ width: "12px", height: "12px", color:'var(--primary-color)' }} />
  //   );

  //   return marker.bindPopup(
  //     `<div style="display: flex; padding: 2px; width: 700px; min-height: 500px; font-family: 'Noto Sans Thai', sans-serif;">
  //       <div style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
  //         <div style="display: flex; justify-content: start; align-items: start; gap: 10px">
  //           ${cameraIconHtml}
  //           <div style="display: flex; flex-direction: column; justify-content: center; align-items: start;">
  //             <label style="font-weight: bold; font-size: 20px; color: var(--primary-color);">${t('text.camera-checkpoint')} : ${detail.checkpoint_name}</label>
  //             <p style="color: var(--primary-color); margin-top: 0px;">${t('text.total-2')} ${cameraLength} จุด</p>
  //           </div>
  //         </div>
  //         <div style="padding: 0px 5px;">
  //           <div style="padding: 10px 15px; background-color: #F0F2F5; width: 100%; height: 80px">
  //             <label style="color: #81898E; font-size: 12px;">${t('text.area-structure')}</label>

  //             <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
  //               ${detail.area_structure
  //                 .map((item, index) => {
  //                   const isLast = index === detail.area_structure.length - 1;

  //                   return `
  //                     <div style="display: flex; align-items: center; gap: 10px;">
  //                       <span style="color: var(--primary-color); font-size: 20px; font-weight: 500;">
  //                         ${item.area_name}
  //                       </span>

  //                       ${
  //                         !isLast
  //                           ? rightArrowIconHtml
  //                           : ""
  //                       }
  //                     </div>
  //                   `;
  //                 })
  //                 .join("")}
  //             </div>
  //           </div>
  //         </div>
  //         <div style="padding: 0px 5px;">
  //           <div style="padding: 10px 15px; background-color: #F0F2F5; width: 100%; min-height: 80px;">
  //             <label style="color: #81898E; font-size: 12px; display: block;">
  //               ${t('text.status')}
  //             </label>

  //             <div style="display: flex; flex-wrap: wrap; justify-content: start; align-items: center; gap: 20px; width: 100%;">
  //               ${
  //                 Object.values(
  //                   sortStatus.reduce((acc, item) => {
  //                     const key = item.status_id;

  //                     if (!acc[key]) {
  //                       acc[key] = {
  //                         status_id: item.status_id,
  //                         status_name: item.status_name,
  //                         count: 0,
  //                       };
  //                     }

  //                     acc[key].count += 1;
  //                     return acc;
  //                   }, {} as Record<number, { status_id: number; status_name: string; count: number }>)
  //                 )
  //                   .map((item) => {
  //                     const cameraColor =
  //                       deviceStatusOptions.find((opt) => opt.id === Number(item.status_id))?.color ?? "#FFFFFF";

  //                     return `
  //                       <div style="display: flex; justify-content: start; align-items: center; gap: 10px; margin-top: 10px;">
  //                         <div style="width: 20px; height: 20px; background-color: ${cameraColor}; border-radius: 50%;"></div>
                          
  //                         <label style="color: var(--primary-color); font-size: 20px; font-weight: 500;">
  //                           ${item.status_name}<span> : ${item.count}</span>
  //                         </label>
  //                       </div>
  //                     `;
  //                   })
  //                   .join("")
  //               }
  //             </div>
  //           </div>
  //         </div>
  //         <div style="padding: 0px 5px;">
  //           <div style="display: flex; flex-direction: column; gap: 5px; width: 100%;">
  //             <label style="color: var(--primary-color); font-size: 16px;">${t('text.camera-checkpoint-list')} :</label>
  //             <div style="max-height: 200px; overflow-y: auto;">
  //               <table style="width: 100%; border-collapse: collapse;">
                  
  //                 <thead>
  //                   <tr style="background-color: var(--primary-color); color: white; font-size: 16px;">
  //                     <th style="position: sticky; top: 0; background-color: var(--primary-color); text-align: center; width: 40%; height: 60px; z-index: 1;">
  //                       ${t('table.header.camera-checkpoint')}
  //                     </th>
  //                     <th style="position: sticky; top: 0; background-color: var(--primary-color); text-align: center; width: 30%; z-index: 1;">
  //                       ${t('table.header.status')}
  //                     </th>
  //                     <th style="position: sticky; top: 0; background-color: var(--primary-color); text-align: center; width: 20%; z-index: 1;">
  //                       ${t('table.header.route')}
  //                     </th>
  //                     <th style="position: sticky; top: 0; background-color: var(--primary-color); text-align: center; width: 10%; z-index: 1;">
  //                       ${t('table.header.lane')}
  //                     </th>
  //                   </tr>
  //                 </thead>

  //                 <tbody>
  //                   ${
  //                     sortStatus
  //                       .map((item, index) => {
  //                         const cameraColor =
  //                           deviceStatusOptions.find((opt) => opt.id === Number(item.status_id))?.color ?? "#FFFFFF";
  //                         return `
  //                           <tr key="${item.camera_name}_${index}" style="border-bottom: 1px solid rgba(var(--primary-color-rgb), 0.1); font-size: 16px; color: var(--primary-color); height: 50px;">
  //                             <td style="padding: 0px 10px;">${item.camera_name}</td>

  //                             <td style="padding: 0px 10px; vertical-align: middle;">
  //                               <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
  //                                 <div style="width: 20px; height: 20px; background-color: ${cameraColor}; border-radius: 50%;"></div>
  //                                 <span>${item.status_name}</span>
  //                               </div>
  //                             </td>

  //                             <td style="padding: 0px 10px;">${item.route}</td>
  //                             <td style="text-align: center;">${item.lane === 1 ? t('text.exit') : t('text.in')}</td>
  //                           </tr>
  //                         `;
  //                       }).join("")
  //                   }
  //                 </tbody>
  //               </table>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>`,
  //     {
  //       offset: [0, -30],
  //       closeButton: true,
  //       maxWidth: 900,
  //       className: "custom-overall-popup",
  //     }
  //   )
  // }

  return {
    clearMarkers,
    markers,
    clearMarkerByLocation,
    createMarker,
    createMarkerWithList,
    createOverallMarkerWithList,
  };
};