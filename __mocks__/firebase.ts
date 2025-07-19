// Simple mock DB in memory
export const mockDB: Record<string, any> = {};

export const ref = (path: string) => ({ path });
export const get = async (ref: any) => ({ val: () => mockDB[ref.path] || null });
export const set = async (ref: any, value: any) => { mockDB[ref.path] = value };
export const update = async (ref: any, value: any) => {
  mockDB[ref.path] = { ...(mockDB[ref.path] || {}), ...value };
};
export const onValue = (ref: any, callback: any) => {
  callback({ val: () => mockDB[ref.path] || null });
};
