// Helper funkcije koje se over and over again reuse u projektu
import { TIMEOUT_SECONDS } from "./config.js";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000); // Nakon sto prodje "s" kolicina vremena ovaj promise automatski rejecta
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          // method je tip requesta koji radimo, u ovom slucaju POST (send)
          method: "POST",
          // Specificira da ce data sto posaljemo biti u json formatu
          headers: {
            "Content-Type": "application/json",
          },
          // body is the data we want to send, sa stringify ga convertamo u JSON
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SECONDS)]);
    // Fetch vrati "response object". Na svaki res. obj. mozemo pozvati .json() method
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err; // Moramo re-throw error da bi invalid Promise koji se vraca iz getJSON bio rejectovan
  }
};
/* 
PRIJE REFACTORINGA SVE U AJAX OVAKO JE IZGLEDALO

export const getJSON = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SECONDS)]);
    // Fetch vrati "response object". Na svaki res. obj. mozemo pozvati .json() method
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err; // Moramo re-throw error da bi invalid Promise koji se vraca iz getJSON bio rejectovan
  }
};

export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPro = fetch(url, {
      // method je tip requesta koji radimo, u ovom slucaju POST (send)
      method: "POST",
      // Specificira da ce data sto posaljemo biti u json formatu
      headers: {
        "Content-Type": "application/json",
      },
      // body is the data we want to send, sa stringify ga convertamo u JSON
      body: JSON.stringify(uploadData),
    });
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SECONDS)]);
    // Fetch vrati "response object". Na svaki res. obj. mozemo pozvati .json() method
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err; // Moramo re-throw error da bi invalid Promise koji se vraca iz getJSON bio rejectovan
  }
}; */
