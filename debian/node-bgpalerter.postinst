#!/bin/bash
# The postinst file is required until sysuser support is added to debhelper-compat (expected in 14)
set -e

case "$1" in
  configure)
    systemd-sysusers
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
    :
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac

#DEBHELPER#

exit 0
