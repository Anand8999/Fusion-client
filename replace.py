
with open('C:/Fusion/Fusion-client/src/Modules/VMS/VMSDashboard.jsx', 'r', encoding='utf-8') as f:
    t = f.read()

import re
import traceback

try:
    old = r'''        } catch (err) {
          if (err.response\?.data\?.error === 'BLACKLISTED_VISITOR') {
              setEscalationPolledStatus\(null\);
              openEscalate\(\);
          } else {
              notifications\.show\({ title: 'Error', message: 'Failed to register\. ID may be blacklisted\.', color: 'red' }\);
          }
        }'''

    new = '''        } catch (err) {
          const errData = err.response?.data || {};
          const errMsg = errData.error || errData.detail || str(errData) || err.message;
          console.error('REGISTER ERROR:', err.response);
          if (typeof errMsg === 'string' && (errMsg.includes('BLACKLISTED_VISITOR') || errMsg.includes('BLACKLISTED'))) {
              setIsBlacklisted(true);
              setEscalationPolledStatus(null);
          } else {
              notifications.show({ title: 'Error', message: 'Failed to register. ' + String(errMsg), color: 'red' });
          }
        }'''

    t = re.sub(old.replace('\n', '\r?\n'), new, t)
    with open('C:/Fusion/Fusion-client/src/Modules/VMS/VMSDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(t)
    print('done')
except Exception as e:
    traceback.print_exc()

